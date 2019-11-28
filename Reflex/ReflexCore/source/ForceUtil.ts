
namespace Reflex
{
	/**
	 * Stores a WeakMap of all forces used across the entire system.
	 */
	const globalForceMap = new WeakMap<StatelessForce, ForceEntry>();
	
	/** */
	class ForceEntry
	{
		readonly systemCallbacks = new Set<RecurrentCallback<Atom>>();
	}
	
	/**
	 * A type that describes a force that contains some state variable that,
	 * when changed, potentially causes the execution of a series of 
	 * recurrent functions.
	 */
	export type StatelessForce = (...args: any[]) => void;
	
	/**
	 * Returns a boolean that indicates whether the specified value
	 * is a stateless or stateful force.
	 */
	export function isForce(fo: any): fo is ((...args: any[]) => void) | StatefulForce
	{
		return isStatelessForce(fo) || fo instanceof StatefulForce;
	}
	
	/**
	 * Guards on whether the specified value is stateless force function.
	 */
	export function isStatelessForce(forceFn: any): forceFn is (...args: any[]) => void
	{
		return !!forceFn && globalForceMap.has(forceFn);
	}
	
	export namespace Core
	{
		/** @internal */
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
					const foFn = globalForceMap.get(userForceFn);
					if (foFn)
						for (const systemCallback of foFn.systemCallbacks)
							systemCallback(...args);
				};
				
				const fe = new ForceEntry();
				globalForceMap.set(userForceFn, fe);
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
				const re = globalForceMap.get(fn);
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
				const fo = globalForceMap.get(fn);
				if (fo)
					fo.systemCallbacks.delete(systemCallback);
			}
		};
	}
}
