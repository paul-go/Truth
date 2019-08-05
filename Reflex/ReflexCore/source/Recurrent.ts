
namespace Reflex.Core
{
	/**
	 * Manages the responsibilities of a single call to on() or only().
	 */
	export class Recurrent<TRunArgs extends any[] = any[]>
	{
		/**
		 * 
		 */
		constructor(
			readonly kind: RecurrentKind,
			readonly selector: any,
			readonly userCallback: RecurrentCallback<Primitives>,
			readonly userRestArgs: any[] = [])
		{
			// In the case when the first argument passed to the
			// recurrent function isn't a valid selector, the parameters
			// are shifted backwards. This is to handle the on() calls
			// that are used to support restorations.
			if (typeof selector === "function" && !isReflex(selector))
			{
				userRestArgs.unshift(userCallback);
				this.userCallback = selector;
				this.selector = "";
			}
		}
		
		/**
		 * 
		 */
		run(...callbackArguments: TRunArgs)
		{
			autorunCache.set(this, callbackArguments);
			return this;
		}
		
		/** Prevent structural type compatibilities. */
		private recurrentNominal: undefined;
	}
	
	/**
	 * @internal
	 * A class that deals with the special case of a Reflex that
	 * was plugged into an attribute.
	 */
	export class AttributeRecurrent extends Recurrent
	{
		constructor(
			private readonly attributeKey: string,
			private readonly reflex: StatefulReflex)
		{
			super(
				RecurrentKind.on, 	
				reflex,
				((now: any) => new AttributeMeta(this.attributeKey, now)));
			
			autorunCache.set(this, []);
		}
	}
	
	/**
	 * @internal
	 * Extracts the autorun arguments from the internal cache.
	 * Can only be executed once.
	 */
	export function extractAutorunArguments(recurrent: Recurrent)
	{
		const args = autorunCache.get(recurrent) || null;
		if (args)
			autorunCache.delete(recurrent);
		
		return args;
	}
	
	const autorunCache = new WeakMap<Recurrent, any[]>();
	
	/**
	 * 
	 */
	export const enum RecurrentKind
	{
		on,
		once,
		only
	}
}
