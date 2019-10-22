
namespace Reflex.Core
{
	/**
	 * @internal
	 * Purely functional utility methods that perform operations for the Relex Core.
	 */
	export const CoreUtil = new class CoreUtil
	{
		/**
		 * Cleans out the cruft from the primitives array,
		 * flattens all arrays, and converts the resulting
		 * values into Meta instances.
		 */
		translatePrimitives(
			containerBranch: IBranch,
			containerMeta: ContainerMeta,
			rawPrimitives: unknown)
		{
			const lib = RoutingLibrary.this;
			const primitives = Array.isArray(rawPrimitives) ?
				rawPrimitives.slice() :
				[rawPrimitives];
			
			for (let i = -1; ++i < primitives.length;)
			{
				const primitive = primitives[i];
				
				// Initial clear out of discarded values.
				if (primitive === null || 
					primitive === undefined || 
					typeof primitive === "boolean" ||
					primitive === "" ||  
					primitive !== primitive || 
					primitive === containerBranch)
					primitives.splice(i--, 1);
				
				// strings, numbers, and bigints are passed through verbatim in this phase.
				else if (typeof primitive !== "object")
					continue;
				
				else if (Array.isArray(primitive))
					primitives.splice(i--, 1, ...primitive);
				
				else if (this.hasSymbol && primitive[Symbol.iterator])
					primitives.splice(i--, 1, ...Array.from(primitive));
			}
			
			const metas: Meta[] = [];
			
			for (let i = -1; ++i < primitives.length;)
			{
				const primitive = primitives[i];
				
				if (primitive instanceof Meta)
					metas.push(primitive);
					
				else if (primitive instanceof Recurrent)
				{
					if (primitive.selector instanceof ArrayForce)
					{
						metas.push(new ArrayStreamMeta(
							containerMeta,
							primitive));
					}
					else
					{
						metas.push(new RecurrentStreamMeta(
							containerMeta,
							primitive));
					}
				}
				else if (typeof primitive === "function")
					metas.push(new ClosureMeta(primitive));
				
				else if (this.isAsyncIterable(primitive))
					metas.push(new AsyncIterableStreamMeta(containerMeta, primitive));
				
				else if (primitive instanceof Promise)
					metas.push(new PromiseStreamMeta(containerMeta, primitive));
				
				else if (this.isAttributes(primitive))
				{
					for (const [k, v] of Object.entries(primitive))
					{
						if (v instanceof StatefulForce)
						{
							metas.push(new RecurrentStreamMeta(
								containerMeta,
								new AttributeRecurrent(k, v)));
						}
						else metas.push(new AttributeMeta(k, v));
					}
				}
				else if (["string", "number", "bigint"].includes(typeof primitive))
				{
					metas.push(new ValueMeta(primitive));
				}
				else
				{
					const existingMeta = 
						BranchMeta.of(primitive) ||
						ContentMeta.of(primitive);
					
					if (existingMeta)
						metas.push(existingMeta);
					
					else if (typeof primitive === "object" &&
						lib.isKnownLeaf(primitive))
						metas.push(new InstanceMeta(primitive));
					
					// This error occurs when something was passed as a primitive 
					// to a branch function, and neither the Reflex core, or any of
					// the connected Reflexive libraries know what to do with it.
					else throw new Error("Unidentified flying object.");
				}
			}
			
			return metas;
		}
		
		/**
		 * 
		 */
		isAttributes(object: any): object is IAttributes
		{
			if (!object || object.constructor !== Object)
				return false;
			
			for (const value of Object.values(object))
			{
				const t = typeof value;
				if (t !== "string" && t !== "number" && t !== "bigint" && t !== "boolean")
					if (!(value instanceof StatefulForce))
						return false;
			}
			
			return true;
		}
		
		/**
		 * 
		 */
		isAsyncIterable(o: any): o is AsyncIterable<any>
		{
			if (this.hasSymbol && o && typeof o === "object")
				if (o[Symbol.asyncIterator])
					if (typeof o.next === "function")
						if (typeof o.return === "function")
							if (typeof o.throw === "function")
								return true;
			
			return false;
		}
		
		/** */
		get hasSymbol()
		{
			return typeof Symbol === "function";
		}
		
		/**
		 * Applies the specified metas to the specified branch, and returns
		 * the last applied branch or content object, which can be used for
		 * future references.
		 */
		applyMetas(
			containingBranch: IBranch,
			containerMeta: ContainerMeta,
			childMetas: Meta[],
			tracker: Tracker = new Tracker(containingBranch))
		{
			const containingBranchMeta = BranchMeta.of(containingBranch);
			if (!containingBranchMeta)
				throw new Error("");
			
			const lib = RoutingLibrary.this;
			childMetas = childMetas.slice();
			
			// ClosureMeta instances need to be collapsed before
			// we proceed so that the locators of any meta that it
			// returns can be assimilated.
			for (let i = -1; ++i < childMetas.length;)
			{
				const meta = childMetas[i];
				if (meta instanceof ClosureMeta)
				{
					if (lib.handleBranchFunction && isBranchFunction(meta.closure))
					{
						lib.handleBranchFunction(
							containingBranch, 
							<(...primitives: any[]) => IBranch>meta.closure);
					}	
					else
					{
						const children = lib.getChildren(containingBranch);
						const closureReturn = meta.closure(containingBranch, children);
						const metasReturned = this.translatePrimitives(
							containingBranch,
							containingBranchMeta,
							closureReturn);
						
						childMetas.splice(i--, 1, ...metasReturned);
					}
				}
			}
			
			for (const meta of childMetas)
				meta.locator.setContainer(containerMeta.locator);
			
			for (let i = -1; ++i < childMetas.length;)
			{
				const meta = childMetas[i];
				
				if (meta instanceof BranchMeta)
				{
					const hardRef = tracker.getLastHardRef();
					lib.attachPrimitive(meta.branch, containingBranch, hardRef);
					tracker.update(meta.branch);
				}
				else if (meta instanceof ContentMeta)
				{
					const hardRef = tracker.getLastHardRef();
					lib.attachPrimitive(meta.value, containingBranch, hardRef);
					tracker.update(meta.value);
				}
				else if (meta instanceof ValueMeta || meta instanceof InstanceMeta)
				{
					lib.attachPrimitive(meta.value, containingBranch, "append");
				}
				else if (meta instanceof StreamMeta)
				{
					if (meta instanceof RecurrentStreamMeta)
						meta.attach(containingBranch, tracker);
					
					else if (meta instanceof AsyncIterableStreamMeta)
						meta.attach(containingBranch, tracker);
					
					else if (meta instanceof ArrayStreamMeta)
						meta.attach(containingBranch, tracker);
					
					else if (meta instanceof PromiseStreamMeta)
					{
						const localTracker = tracker.derive();
						localTracker.update(meta.locator);
						meta.attach(containingBranch, localTracker);
					}
				}
				else if (meta instanceof AttributeMeta)
				{
					lib.attachAttribute(containingBranch, meta.key, meta.value);
				}
				
				if (Const.debug || Const.node)
					childrenOf.store(containingBranch, meta);
				
				tracker.update(meta.locator);
			}
		}
		
		/**
		 * 
		 */
		unapplyMetas(
			containingBranch: IBranch,
			childMetas: Meta[])
		{
			const lib = RoutingLibrary.this;
			
			for (const meta of childMetas)
			{
				// ClosureMetas can be safely ignored.
				if (meta instanceof ClosureMeta)
					continue;
				
				if (meta instanceof ContentMeta || meta instanceof ValueMeta)
					lib.detachPrimitive(meta.value, containingBranch);
				
				else if (meta instanceof AttributeMeta)
					lib.detachAttribute(containingBranch, meta.value);
				
				else if (meta instanceof BranchMeta)
					// We should probably consider getting rid of this
					// You would be able to re-discover the branch by
					// enumerating through the children of containingBranch,
					// using the getChildren() method provided by the library.
					lib.detachPrimitive(meta.branch, containingBranch);
				
				else if (meta instanceof RecurrentStreamMeta)
					meta.detachRecurrents(
						containingBranch,
						meta.recurrent.selector,
						meta.systemCallback);
				
				else if (meta instanceof PromiseStreamMeta)
					throw new Error("Not implemented.");
				
				else if (meta instanceof AsyncIterableStreamMeta)
					throw new Error("Not implemented.");
			}
		}
	}();
}
