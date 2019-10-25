
namespace Reflex.Core
{
	/**
	 * @internal
	 * Handles the running of recurrent functions that are built into
	 * the Reflex Core.
	 */
	export class CoreRecurrent
	{
		/** */
		static readonly selectors = Object.freeze([
			"reflex:attach-atomic",
			"reflex:detach-atomic"
		] as const);
		
		/**
		 * 
		 */
		static attachAtomic(branch: IBranch, atomic: any)
		{
			this.run("reflex:attach-atomic", branch, [atomic, branch]);
		}
		
		/**
		 * 
		 */
		static detachAtomic(branch: IBranch, atomic: any)
		{
			this.run("reflex:detach-atomic", branch, [atomic, branch]);
		}
		
		/**
		 *
		 */
		private static run(selector: string, branch: IBranch, args: any[])
		{
			const recs = this.listeners.get(branch);
			if (recs)
				for (const rec of recs)
					if (rec.selector === selector)
						if (rec.userCallback(...args, ...rec.userRestArgs) === true)
							recs.delete(rec);
		}
		
		/**
		 * 
		 */
		static listen(branch: IBranch, recurrent: Recurrent)
		{
			let recs = this.listeners.get(branch);
			recs ?
				recs.add(recurrent) :
				this.listeners.set(branch, new Set([recurrent]));
		}
		
		/** */
		private static readonly listeners = new WeakMap<IBranch, Set<Recurrent>>();
	}
}

/**
 * 
 */
declare function on(
	events: "reflex:attach-atomic",
	callback: (atomic: any, branch: Reflex.Core.IBranch) => true | void,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	events: "reflex:detach-atomic",
	callback: (atomic: any, branch: Reflex.Core.IBranch) => true | void,
): Reflex.Core.Recurrent;
