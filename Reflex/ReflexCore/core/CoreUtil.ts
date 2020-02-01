
namespace Reflex.Core
{
	/**
	 * @internal
	 * Purely functional utility methods that perform operations for the Relex Core.
	 */
	export const CoreUtil = new class CoreUtil
	{
		/**
		 * Cleans out the cruft from the atoms array,
		 * flattens all arrays, and converts the resulting
		 * values into Meta instances.
		 */
		translateAtoms(
			containerBranch: IBranch,
			containerMeta: ContainerMeta,
			rawAtoms: unknown)
		{
			const atoms = Array.isArray(rawAtoms) ?
				rawAtoms.slice() :
				[rawAtoms];
			
			let lib: ILibrary | null = null;
			
			for (let i = -1; ++i < atoms.length;)
			{
				const atom = atoms[i];
				
				// Initial clear out of discarded values.
				if (atom === null || 
					atom === undefined || 
					typeof atom === "boolean" ||
					atom === "" || 
					atom !== atom || 
					atom === containerBranch)
					atoms.splice(i--, 1);
				
				// strings, numbers, and bigints are passed through verbatim in this phase.
				else if (typeof atom !== "object")
					continue;
				
				else if (Array.isArray(atom))
					atoms.splice(i--, 1, ...atom);
				
				else if (this.hasSymbol && atom[Symbol.iterator])
					atoms.splice(i--, 1, ...Array.from(atom));
			}
			
			const metas: Meta[] = [];
			
			for (let i = -1; ++i < atoms.length;)
			{
				const atom = atoms[i];
				const typeOf = typeof atom;
				const existingMeta = BranchMeta.of(atom) || LeafMeta.of(atom);
				
				if (existingMeta &&
					((lib = lib || RoutingLibrary.of(containerBranch)) === existingMeta.library))
					metas.push(existingMeta);
				
				else if (atom instanceof Meta)
					metas.push(atom);
				
				else if (atom instanceof Recurrent)
				{
					if (atom.selector instanceof ArrayForce)
					{
						metas.push(new ArrayStreamMeta(
							containerMeta,
							atom));
					}
					else
					{
						metas.push(new RecurrentStreamMeta(
							containerMeta,
							atom));
					}
				}
				else if (atom[Reflex.atom])
					metas.push(new ClosureMeta(this.createSymbolicClosure(atom)));
				
				else if (typeOf === "function")
					metas.push(new ClosureMeta(atom));
				
				else if (
					typeOf === "string" ||
					typeOf === "number" ||
					typeOf === "bigint")
					metas.push(new ValueMeta(atom));
				
				else if (this.isAsyncIterable(atom))
					metas.push(new AsyncIterableStreamMeta(containerMeta, atom));
				
				else if (atom instanceof Promise)
					metas.push(new PromiseStreamMeta(containerMeta, atom));
				
				else if (this.isAttributes(atom))
				{
					for (const [k, v] of Object.entries(atom))
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
				
				// This error occurs when something was passed as a atom 
				// to a branch function, and neither the Reflex core, or any of
				// the connected Reflexive libraries know what to do with it.
				else throw new Error("Unidentified flying object.");
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
		 * Creates a temporary closure function for the
		 * specified symbolic atom object.
		 */
		private createSymbolicClosure(atom: any)
		{
			return (branch: IBranch, children: any[]) =>
			{
				const property = atom[Reflex.atom];
				return typeof property === "function" ?
					property.call(atom, branch, children) :
					property;
			}
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
			
			for (let i = -1; ++i < childMetas.length;)
			{
				const meta = childMetas[i];
				
				// ClosureMeta instances must be dealt with first, because
				// they can return other Meta instances, and those Meta
				// instances are the ones that (likely) have Locators that
				// must be assimilated (i.e. by calling .setContainer())
				// The ClosureMeta instances themselves don't participate
				// in the Tracker / Locator madness, but they can return 
				// other Meta instances that do.
				if (meta instanceof ClosureMeta)
				{
					if (lib.handleBranchFunction && isBranchFunction(meta.closure))
					{
						lib.handleBranchFunction(
							containingBranch, 
							<(...atoms: any[]) => IBranch>meta.closure);
					}
					else
					{
						const children = lib.getChildren(containingBranch);
						const closureReturn = meta.closure(containingBranch, children);
						const metasReturned = this.translateAtoms(
							containingBranch,
							containingBranchMeta,
							closureReturn);
						
						if (metasReturned.length < 1)
							continue;
						
						childMetas.splice(i--, 1, ...metasReturned);
					}
				}
				
				meta.locator.setContainer(containerMeta.locator);
				
				if (meta instanceof BranchMeta)
				{
					const hardRef = tracker.getLastHardRef();
					lib.attachAtom(meta.branch, containingBranch, hardRef);
					tracker.update(meta.branch);
				}
				else if (meta instanceof LeafMeta)
				{
					const hardRef = tracker.getLastHardRef();
					lib.attachAtom(meta.value, containingBranch, hardRef);
					tracker.update(meta.value);
				}
				else if (meta instanceof ValueMeta)
				{
					lib.attachAtom(meta.value, containingBranch, "append");
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
					lib.detachAtom(meta.value, containingBranch);
				
				else if (meta instanceof AttributeMeta)
					lib.detachAttribute(containingBranch, meta.value);
				
				else if (meta instanceof BranchMeta)
					// We should probably consider getting rid of this
					// You would be able to re-discover the branch by
					// enumerating through the children of containingBranch,
					// using the getChildren() method provided by the library.
					lib.detachAtom(meta.branch, containingBranch);
				
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
