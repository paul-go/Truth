
namespace Reflex
{
	const autorunCache = new WeakMap<Recurrent, any[]>();
	
	/**
	 * Manages the responsibilities of a single call to on() or only().
	 */
	export class Recurrent<TRunArgs extends any[] = any[]>
	{
		/**
		 * 
		 */
		constructor(
			readonly kind: Core.RecurrentKind,
			readonly selector: any,
			readonly userCallback: RecurrentCallback<Atom>,
			readonly userRestArgs: any[] = [])
		{
			// In the case when the first argument passed to the
			// recurrent function isn't a valid selector, the parameters
			// are shifted backwards. This is to handle the on() calls
			// that are used to support restorations.
			if (typeof selector === "function" && !isForce(selector))
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
	
	export namespace Core
	{
		/**
		 * @internal
		 * A class that deals with the special case of a Force that
		 * was plugged into an attribute.
		 */
		export class AttributeRecurrent extends Recurrent
		{
			constructor(
				attributeKey: string,
				force: StatefulForce)
			{
				super(
					RecurrentKind.on, 	
					force,
					((now: any) => new AttributeMeta(attributeKey, now)));
				
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
}
