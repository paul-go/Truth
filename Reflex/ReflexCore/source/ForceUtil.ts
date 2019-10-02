
namespace Reflex.Core
{
	/**
	 * 
	 */
	export type StatelessForce<A extends any[] = any[]> = (...args: A) => void;
	
	/**
	 * Returns a boolean that indicates whether the specified value
	 * is a stateless or stateful force.
	 */
	export function isForce(target: any)
	{
		// TODO: This function also needs to check for ArrayForce's
		return isForceFunction(target) ||
			target instanceof StatefulForce;
	}
	
	/**
	 * Guards on whether the specified value is stateless force function.
	 */
	export function isForceFunction(forceFn: any): forceFn is (...args: any) => void
	{
		return !!forceFn && entries.has(forceFn);
	}
	
	/**
	 * @internal
	 */
	export const ForceUtil =
	{
		/** */
		createFunction()
		{
			// The user force function is sent back to the user, who uses
			// this function as a parameter to other on() calls, or to call
			// directly when the thing happens.
			const userForceFn = (...args: any[]) =>
			{
				const reFn = entries.get(userForceFn);
				if (reFn)
					for (const systemCallback of reFn.systemCallbacks)
						systemCallback(...args);
			};
			
			const entry = new Entry();
			entries.set(userForceFn, entry);
			return userForceFn;
		},
		
		/**
		 * Returns the StatelessForce that corresponds to the specified
		 * force function.
		 */
		attachForce(
			fn: StatelessForce, 
			systemCallback: RecurrentCallback<Primitives>)
		{
			const re = entries.get(fn);
			if (re)
				re.systemCallbacks.add(systemCallback);
		},
		
		/**
		 * 
		 */
		detachForce(
			fn: StatelessForce,
			systemCallback: RecurrentCallback<Primitives>)
		{
			const fo = entries.get(fn);
			if (fo)
				fo.systemCallbacks.delete(systemCallback);
		}
	};
	
	
	/** */
	const entries = new WeakMap<StatelessForce, Entry>();
	
	class Entry
	{
		readonly systemCallbacks = new Set<RecurrentCallback<Primitives>>();
	}
}
