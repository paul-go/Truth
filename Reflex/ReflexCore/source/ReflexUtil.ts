
namespace Reflex.Core
{
	/**
	 * 
	 */
	export type StatelessReflex<A extends any[] = any[]> = (...args: A) => void;
	
	/**
	 * Returns a boolean that indicates whether the specified value
	 * is a stateless or stateful reflex.
	 */
	export function isReflex(target: any)
	{
		// TODO: This function also needs to check for ArrayReflex's
		return isReflexFunction(target) ||
			target instanceof StatefulReflex;
	}
	
	/**
	 * Guards on whether the specified value is stateless reflex function.
	 */
	export function isReflexFunction(reflexFn: any): reflexFn is (...args: any) => void
	{
		return !!reflexFn && entries.has(reflexFn);
	}
	
	/**
	 * @internal
	 */
	export const ReflexUtil =
	{
		/** */
		createFunction()
		{
			// The user reflex function is sent back to the user, who uses
			// this function as a parameter to other on() calls, or to call
			// directly when the thing happens.
			const userReflexFn = (...args: any[]) =>
			{
				const reFn = entries.get(userReflexFn);
				if (reFn)
					for (const systemCallback of reFn.systemCallbacks)
						systemCallback(...args);
			};
			
			const entry = new Entry();
			entries.set(userReflexFn, entry);
			return userReflexFn;
		},
		
		/**
		 * Returns the StatelessReflex that corresponds to the specified
		 * reflex function.
		 */
		attachReflex(
			fn: StatelessReflex, 
			systemCallback: RecurrentCallback<Primitives>)
		{
			const re = entries.get(fn);
			if (re)
				re.systemCallbacks.add(systemCallback);
		},
		
		/**
		 * 
		 */
		detachReflex(
			fn: StatelessReflex,
			systemCallback: RecurrentCallback<Primitives>)
		{
			const re = entries.get(fn);
			if (re)
				re.systemCallbacks.delete(systemCallback);
		}
	};
	
	
	/** */
	const entries = new WeakMap<StatelessReflex, Entry>();
	
	class Entry
	{
		readonly systemCallbacks = new Set<RecurrentCallback<Primitives>>();
	}
}
