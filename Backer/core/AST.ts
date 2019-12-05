
namespace Backer.TruthTalk
{
	export type Atomic = Reflex.Atom<Node, Branch>;
	export type Atomics = Reflex.Atom<Node, Branch>;
	
	/** */
	export interface Namespace extends
		Reflex.Core.IBranchNamespace<Atomics, Branches.Query>
	{
		/** */
		is(...atomics: Atomics[]): Branches.Is;
		
		/** */
		has(...atomics: Atomics[]): Branches.Has;
		
		/** */
		not(...atomics: Atomics[]): Branches.Not;
		
		/** */
		or(...atomics: Atomics[]): Branches.Or;
		
		/** */
		containers(): Leaves.Containers;
		
		/** */
		root(): Leaves.Roots;
		
		/** */
		contents(): Leaves.Contents;
		
		/** */
		equals(value: string | number | boolean): Leaves.Predicate;
		
		/** */
		greaterThan(value: string | number): Leaves.Predicate;
		
		/** */
		lessThan(value: string | number): Leaves.Predicate;
		
		/** */
		startsWith(value: string | number): Leaves.Predicate;
		
		/** */
		endsWith(value: string | number): Leaves.Predicate;
		
		/** */
		aliased(): Leaves.Aliased;
		
		/** */
		leaves(): Leaves.Leaves;
		
		/** */
		fresh(): Leaves.Fresh;
		
		/** */
		slice(start: number, end?: number): Leaves.Slice;
		
		/** */
		occurences(min: number, max?: number): Leaves.Occurences;
		
		/** */
		sort(...contentTypes: Object[]): Leaves.Sort;
		
		/** */
		reverse(): Leaves.Reverse;
		
		/** */
		names(): Leaves.Names;
		
		/** */
		named(value: string): Leaves.Predicate;
		
		/** */
		sum(): Leaves.Sum;
		
		/** */
		avg(): Leaves.Avg;
		
		/** */
		min(): Leaves.Min;
		
		/** */
		max(): Leaves.Max;
		
		/** */
		count(): Leaves.Count;
	}
}
