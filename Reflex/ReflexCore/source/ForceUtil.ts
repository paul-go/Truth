
namespace Reflex
{
	/** */
	const entries = new WeakMap<StatelessForce, Entry>();
	
	/** */
	class Entry
	{
		readonly systemCallbacks = new Set<RecurrentCallback<Atom>>();
	}
	
	/**
	 * A type that describes a force that contains some state variable that,
	 * when changed, potentially causes the execution of a series of 
	 * recurrent functions.
	 */
	export type StatelessForce<A extends any[] = any[]> = (...args: A) => void;
	
	/**
	 * Returns a boolean that indicates whether the specified value
	 * is a stateless or stateful force.
	 */
	export function isForce(fo: any): fo is ((...args: any[]) => void) | StatefulForce
	{
		// TODO: This function also needs to check for ArrayForce's
		return isStatelessForce(fo) || fo instanceof StatefulForce;
	}
	
	/**
	 * Guards on whether the specified value is stateless force function.
	 */
	export function isStatelessForce(forceFn: any): forceFn is (...args: any[]) => void
	{
		return !!forceFn && entries.has(forceFn);
	}
	
	export namespace Core
	{
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
				systemCallback: RecurrentCallback<Atom>)
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
				systemCallback: RecurrentCallback<Atom>)
			{
				const fo = entries.get(fn);
				if (fo)
					fo.systemCallbacks.delete(systemCallback);
			}
		};
	}
}
