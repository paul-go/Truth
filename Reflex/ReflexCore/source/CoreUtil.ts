
namespace Reflex.Core
{
	/**
	 * @internal
	 * Purely functional utility methods that perform operations for the Relex Core.
	 */
	export const CoreUtil = new class CoreUtil
	{
		/**
		 * Cleans out the cruft from the atomics array,
		 * flattens all arrays, and converts the resulting
		 * values into Meta instances.
		 */
		translateAtomics(
			containerBranch: IBranch,
			containerMeta: ContainerMeta,
			rawAtomics: unknown)
		{
			const lib = RoutingLibrary.this;
			const atomics = Array.isArray(rawAtomics) ?
				rawAtomics.slice() :
				[rawAtomics];
			
			for (let i = -1; ++i < atomics.length;)
			{
				const atomic = atomics[i];
				
				// Initial clear out of discarded values.
				if (atomic === null || 
					atomic === undefined || 
					typeof atomic === "boolean" ||
					atomic === "" ||  
					atomic !== atomic || 
					atomic === containerBranch)
					atomics.splice(i--, 1);
				
				// strings, numbers, and bigints are passed through verbatim in this phase.
				else if (typeof atomic !== "object")
					continue;
				
				else if (Array.isArray(atomic))
					atomics.splice(i--, 1, ...atomic);
				
				else if (this.hasSymbol && atomic[Symbol.iterator])
					atomics.splice(i--, 1, ...Array.from(atomic));
			}
			
			const metas: Meta[] = [];
			
			for (let i = -1; ++i < atomics.length;)
			{
				const atomic = atomics[i];
				const typeOf = typeof atomic;
				
				if (atomic instanceof Meta)
					metas.push(atomic);
					
				else if (atomic instanceof Recurrent)
				{
					if (atomic.selector instanceof ArrayForce)
					{
						metas.push(new ArrayStreamMeta(
							containerMeta,
							atomic));
					}
					else if (CoreRecurrent.selectors.includes(atomic.selector))
					{
						CoreRecurrent.listen(containerBranch, atomic);
					}
					else
					{
						metas.push(new RecurrentStreamMeta(
							containerMeta,
							atomic));
					}
				}
				else if (typeOf === "function")
					metas.push(new ClosureMeta(atomic));
				
				else if (
					typeOf === "string" ||
					typeOf === "number" ||
					typeOf === "bigint" ||
					atomic instanceof Volatile)
					metas.push(new ValueMeta(atomic));
				
				else if (this.isAsyncIterable(atomic))
					metas.push(new AsyncIterableStreamMeta(containerMeta, atomic));
				
				else if (atomic instanceof Promise)
					metas.push(new PromiseStreamMeta(containerMeta, atomic));
				
				else if (this.isAttributes(atomic))
				{
					for (const [k, v] of Object.entries(atomic))
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
				else
				{
					const existingMeta = 
						BranchMeta.of(atomic) ||
						LeafMeta.of(atomic);
					
					if (existingMeta)
						metas.push(existingMeta);
					
					// This error occurs when something was passed as a atomic 
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
		 * the last applied branch or leaf object, which can be used for
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
							<(...atomics: any[]) => IBranch>meta.closure);
					}	
					else
					{
						const children = lib.getChildren(containingBranch);
						const closureReturn = meta.closure(containingBranch, children);
						const metasReturned = this.translateAtomics(
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
					lib.attachAtomic(meta.branch, containingBranch, hardRef);
					tracker.update(meta.branch);
				}
				else if (meta instanceof LeafMeta)
				{
					const hardRef = tracker.getLastHardRef();
					lib.attachAtomic(meta.value, containingBranch, hardRef);
					tracker.update(meta.value);
				}
				else if (meta instanceof ValueMeta)
				{
					lib.attachAtomic(meta.value, containingBranch, "append");
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
				
				if (meta instanceof LeafMeta || meta instanceof ValueMeta)
					lib.detachAtomic(meta.value, containingBranch);
				
				else if (meta instanceof AttributeMeta)
					lib.detachAttribute(containingBranch, meta.value);
				
				else if (meta instanceof BranchMeta)
					// We should probably consider getting rid of this
					// You would be able to re-discover the branch by
					// enumerating through the children of containingBranch,
					// using the getChildren() method provided by the library.
					lib.detachAtomic(meta.branch, containingBranch);
				
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
