
declare class Truth
{
	/**
	 * A function that returns the internal base class used by all 
	 * trait classes, intended for use in a TypeScript / JavaScript
	 * "extends " clause.
	 */
	static class(...traits: readonly Truth.Trait[]): Truth.Class
}

namespace Truth
{
	/** */
	export type Construct = Truth.Type | Truth.Class;
	
	/**
	 * Describes a reference to a user-defined Trait Class, which
	 * will eventually be resolved to a Truth.Type object after passing
	 * through the compiler.
	 */
	export type Class = (new() => TraitClass) & typeof TraitClass;
	
	/**
	 * The base class that is resolved from calls to the Truth.class()
	 * function. Do not invoke directly from user code.
	 */
	export abstract class TraitClass
	{
		readonly is?: (Class) | (Class)[];
		readonly has?: (Class) | (Class)[];
		readonly pattern?: RegExp;
	}
	
	/**
	 * @internal
	 * The *actual* internal class that is resolved from calls to
	 * Truth.class(). This layer of inheritance adds a member
	 * to store the actualy traits.
	 */
	export class TraitClassInternal extends TraitClass
	{
		constructor(readonly traits: readonly Trait[])
		{
			super();
		}
	}
	
	/**
	 * @internal
	 * Refer to Truth.class()
	 */
	Truth["class"] = (...traits: readonly Trait[]): Class =>
	{
		return TraitClassInternal.bind(null, traits);
	}
	
	/** */
	export type ArrowFunction<P extends any[] = any[], R = any> = (...args: P) => R;
	
	/**
	 * 
	 */
	export class Trait<F extends ArrowFunction = ArrowFunction>
	{
		constructor(
			readonly definition: TraitDefinition,
			readonly implementation: F) { }
	}
	
	export type TraitDefinition = 
		(impl: (...args: any[]) => any) => Trait<TraitDefinition>;
	
	export type TraitImplementation<T extends TraitDefinition> = 
		T extends (impl: infer F) => any ? F : never;
	
	export type TraitEntryPoint<D extends TraitDefinition> = 
		TraitImplementation<D>;
	
	/*
	Possibly useful definitions, unused for now:
	
	type FunctionRest<F extends (...args: any[]) => any> =
		F extends ((first: any, ...rest: infer A) => infer R) ? (...args: A) => R : never;
	
	type TraitParameters<T extends TraitDefinition> =
		T extends (impl: (...args: infer P) => any) => any ? P : never;
	
	type TraitReturn<T extends TraitDefinition> = 
		T extends (impl: (...args: any[]) => infer R) => any ? R : never;
	*/
}


