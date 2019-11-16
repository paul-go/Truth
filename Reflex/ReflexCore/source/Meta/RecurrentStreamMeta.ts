
namespace Reflex.Core
{
	/**
	 * 
	 */
	export class RecurrentStreamMeta extends StreamMeta
	{
		/** */
		constructor(
			readonly containerMeta: ContainerMeta,
			readonly recurrent: Recurrent,
			locator?: Locator)
		{
			super(containerMeta, locator);
			this.recurrent = recurrent;
			const self = this;
			
			this._systemCallback = (function(this: IBranch, ...systemRestArgs: any[])
			{
				// This is cheating a bit. We're getting the branch
				// from the "this" reference passed to event callbacks.
				// Some libraries (such as the DOM) set the "this" reference
				// to what essentially amounts to the branch we're trying
				// to get, without actually storing a reference to it. Hopefully
				// the other platforms on which reflexive libraries are built
				// will exhibit (or can be made to exibit) this same behavior.
				
				if (this === null)
					throw new Error("Library not implemented properly.");
				
				const wasMetas = resolveReturned(self.returned, this);
				
				if (!self.inAutoRunContext)
					if (RoutingLibrary.this.isBranchDisposed(this))
					{
						self.detachRecurrents(
							this,
							recurrent.selector,
							self.systemCallback);
						
						CoreUtil.unapplyMetas(this, wasMetas);
						self.returned.length = 0;
						return;
					}
				
				// This is a safety check, we're also doing this below, but it's
				// important to make sure this gets set to false as soon as possible.
				self.inAutoRunContext = false;
				
				const fn = recurrent.userCallback;
				const r = systemRestArgs
					.concat(this)
					.concat(recurrent.userRestArgs);
				
				let p: any;
				
				switch (r.length)
				{
					case 0: p = fn(); break;
					case 1: p = fn(r[0]); break;
					case 2: p = fn(r[0], r[1]); break;
					case 3: p = fn(r[0], r[1], r[2]); break;
					case 4: p = fn(r[0], r[1], r[2], r[3]); break;
					case 5: p = fn(r[0], r[1], r[2], r[3], r[4]); break;
					case 6: p = fn(r[0], r[1], r[2], r[3], r[4], r[5]); break;
					case 7: p = fn(r[0], r[1], r[2], r[3], r[4], r[5], r[6]); break;
					case 8: p = fn(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]); break;
					case 9: p = fn(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8]); break;
					case 10: p = fn(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9]); break;
					default: p = fn(...r);
				}
				
				// This is a quick test to avoid doing pointless work
				// in the relatively common case that the recurrent
				// doesn't have a relevant return value.
				if (wasMetas.length > 0 || p !== undefined && p !== null)
				{
					const nowMetas = CoreUtil.translateAtoms(this, containerMeta, p);
					
					if (self.when)
						self.when(wasMetas, nowMetas, this);
					
					self.returned.length = 0;
					
					if (recurrent.kind !== RecurrentKind.once)
						self.returned.push(...unresolveReturned(nowMetas));
				}
				
				if (recurrent.kind === RecurrentKind.once)
					CoreUtil.unapplyMetas(this, [self]);
			});
		}
		
		/**
		 * Stores the wrapped version of the user's callback that gets added
		 * to the Reflexive library's tree (such as via an addEventListener() call).
		 */
		get systemCallback(): RecurrentCallback
		{
			if (this._systemCallback === null)
				throw new Error();
			
			return this._systemCallback;
		}
		private _systemCallback: RecurrentCallback;
		
		/**
		 * Applies the stream meta (and any metas that are streamed from it
		 * at any point in the future) to the specified containing branch.
		 * 
		 * Returns the input ref value, or the last synchronously inserted meta.
		 */
		attach(containingBranch: IBranch, tracker: Tracker)
		{
			this._systemCallback = this._systemCallback.bind(containingBranch);
			
			const localTracker = tracker.derive();
			localTracker.update(this.locator);
			const rec = this.recurrent;
			
			this.when = (wasMetas, nowMetas) =>
			{
				if (wasMetas.length)
					CoreUtil.unapplyMetas(containingBranch, wasMetas);
				
				for (const nowMeta of nowMetas)
					nowMeta.locator.setContainer(this.locator);
				
				CoreUtil.applyMetas(
					containingBranch,
					this,
					nowMetas,
					localTracker);
			};
			
			const selector = Array.isArray(rec.selector) ?
				rec.selector :
				[rec.selector];
			
			for (const selectorItem of selector)
			{
				if (selectorItem instanceof StatefulForce)
					ForceUtil.attachForce(selectorItem.changed, this.systemCallback);
				
				else if (isStatelessForce(selectorItem))
					ForceUtil.attachForce(selectorItem, this.systemCallback);
				
				else switch (selectorItem)
				{
					case mutation.any: break;
					case mutation.branch: break;
					case mutation.branchAdd: break;
					case mutation.branchRemove: break;
					case mutation.leaf: break;
					case mutation.leafAdd: break;
					case mutation.leafRemove: break;
					default: RoutingLibrary.this.attachRecurrent(
						rec.kind,
						containingBranch,
						selectorItem,
						this.systemCallback,
						this.recurrent.userRestArgs);
				}
			}
			
			const autorunArguments = extractAutorunArguments(rec);
			if (autorunArguments)
			{
				const item = selector[0];
				
				if (item instanceof StatefulForce)
					this.invokeAutorunCallback([item.value, item.value], containingBranch);
				
				else if (isStatelessForce(item))
					this.invokeAutorunCallback(autorunArguments, containingBranch);
				
				else if (typeof item === "string" && item in Reflex.mutation)
					this.invokeAutorunCallback([Reflex.mutation.any], containingBranch);
				
				else
					this.invokeAutorunCallback([], containingBranch);
			}
		}
		
		/**
		 * 
		 */
		detachRecurrents(
			branch: IBranch,
			selector: any,
			systemCallback: RecurrentCallback<Atom>)
		{
			const lib = RoutingLibrary.this;
			
			if (!Array.isArray(selector))
				lib.detachRecurrent(branch, selector, systemCallback);
			
			else for (const selectorPart of selector)
				lib.detachRecurrent(branch, selectorPart, systemCallback);
		}
		
		/**
		 * Call this method to indirectly invoke the systemCallback, but done
		 * in a way that makes it aware that it's being run via the autorun.
		 */
		invokeAutorunCallback(args: any[], thisArg?: IBranch)
		{
			try
			{
				this.inAutoRunContext = true;
				
				thisArg ?
					this.systemCallback.apply(thisArg, args) :
					this.systemCallback(...args);
			}
			finally
			{
				this.inAutoRunContext = false;
			}
		}
		
		/** */
		private inAutoRunContext = false;
		
		/**
		 * The callback that triggers when the new metas have been processed.
		 */
		private when: ((wasMetas: Meta[], nowMetas: Meta[], branch: IBranch) => void) | null = null;
		
		/**
		 * Stores an array of values that were returned from the
		 * recurrent function, in storagized form.
		 */
		private readonly returned: (Meta | Locator)[] = [];
	}
	
	/**
	 * Returns a new array that is a copy of the specified return array,
	 * except with the unsafe metas replaced with locators.
	 */
	function unresolveReturned(returned: Meta[])
	{
		const unresolved: (Meta | Locator)[] = [];
		
		for (const meta of returned)
		{
			unresolved.push(
				meta instanceof BranchMeta || meta instanceof LeafMeta ?
					meta.locator :
					meta);
		}
		
		return unresolved;
	}
	
	/**
	 * Returns a new array that is the copy of the specified return array,
	 * except with any instances of Locator replaced with the actual meta.
	 */
	function resolveReturned(returned: (Meta | Locator)[], containingBranch: IBranch)
	{
		const resolved: (Meta | null)[] = new Array(returned.length).fill(null);
		let hasLocators = false;
		
		// Pre-populate the resolved array with everything that is already a meta.
		for (let i = -1; ++i < returned.length;)
		{
			const r = returned[i];
			if (r instanceof Meta)
				resolved[i] = r;
			else
				hasLocators = true;
		}
		
		// Avoid hitting the library if possible
		if (!hasLocators)
			return <Meta[]>returned.slice();
		
		const children = Array.from(RoutingLibrary.this.getChildren(containingBranch));
		
		for (let retIdx = -1; ++retIdx < returned.length;)
		{
			const ret = returned[retIdx];
			if (ret instanceof Locator)
			{
				for (let childIdx = -1; ++childIdx < children.length;)
				{
					const child = children[childIdx];
					const childMeta = 
						BranchMeta.of(<any>child) ||
						LeafMeta.of(<any>child);
					
					if (!childMeta)
						continue;
					
					const cmp = ret.compare(childMeta.locator);
					
					if (cmp === CompareResult.equal)
					{
						resolved[retIdx] = childMeta;
						break;
					}
				}
			}
			else resolved[retIdx] = ret;
		}
		
		return resolved.filter((r): r is Meta => r !== null);
	}
}
