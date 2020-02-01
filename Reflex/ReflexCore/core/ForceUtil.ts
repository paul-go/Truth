
namespace Reflex
{
	/**
	 * Stores a WeakMap of all forces used across the entire system.
	 */
	const globalForceMap = new WeakMap<Function, ForceEntry>();
	
	/** */
	class ForceEntry
	{
		readonly systemCallbacks = new Set<RecurrentCallback<Atom>>();
		readonly watchers: ArrowFunction[] = [];
	}
	
	/**
	 * A type that describes a parameterless force function that
	 * triggers the execution of any connected recurrent functions
	 * when called.
	 */
	export interface StatelessForce
	{
		/**
		 * Triggers the force, and consequently invokes any connected reflexes.
		 */
		(): void;
		
		/**
		 * Attaches a watcher function that is called immediately before this
		 * StatelessForce is about to be triggered.
		 */
		watch(watchFn: () => void): StatelessForce;
	}
	
	/** */
	export type ArrowFunction = (...args: any[]) => void;
	
	/**
	 * A type that describes a force function with 1 or more parameters
	 * that triggers the execution of any connected recurrent functions
	 * when called.
	 */
	export type StatelessForceParametric<F extends ArrowFunction> =
	{
		/**
		 * Triggers the force, and consequently invokes any connected reflexes,
		 * and passes them the specified arguments.
		 */
		(...args: Parameters<F>): void;
		
		/**
		 * Attaches a watcher function that is called immediately before this
		 * StatelessForce is about to be triggered.
		 */
		watch(watchFn: F): StatelessForceParametric<F>;
	};
	
	/**
	 * Returns a boolean that indicates whether the specified value
	 * is a stateless or stateful force.
	 */
	export function isForce(fo: any): fo is ArrowFunction | StatefulForce
	{
		return isStatelessForce(fo) || fo instanceof StatefulForce;
	}
	
	/**
	 * Guards on whether the specified value is stateless force function.
	 */
	export function isStatelessForce(forceFn: any): forceFn is StatelessForce
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
					{
						for (const watcherFn of foFn.watchers)
							watcherFn(...args);
							
						for (const systemCallback of foFn.systemCallbacks)
							systemCallback(...args);
					}
				};
				
				(<StatelessForce>userForceFn).watch = (function(this: Function, watchFn: ArrowFunction)
				{
					const foFn = globalForceMap.get(this);
					if (foFn)
						foFn.watchers.push(watchFn);
					
					return <any>this;
					
				}).bind(userForceFn);
				
				const fe = new ForceEntry();
				globalForceMap.set(userForceFn, fe);
				return userForceFn;
			},
			
			/**
			 * Returns the StatelessForce that corresponds to the specified
			 * force function.
			 */
			attachForce<F extends ArrowFunction>(
				fn: StatelessForce | StatelessForceParametric<F>,
				systemCallback: RecurrentCallback<Atom>)
			{
				const re = globalForceMap.get(fn);
				if (re)
					re.systemCallbacks.add(systemCallback);
			},
			
			/**
			 * 
			 */
			detachForce<F extends ArrowFunction>(
				fn: StatelessForce | StatelessForceParametric<F>,
				systemCallback: RecurrentCallback<Atom>)
			{
				const fo = globalForceMap.get(fn);
				if (fo)
					fo.systemCallbacks.delete(systemCallback);
			}
		};
	}
}
