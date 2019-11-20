
namespace Reflex
{
	/** */
	export enum mutation
	{
		any = "mutation-any",
		branch = "mutation-branch",
		branchAdd = "mutation-branch-add",
		branchRemove = "mutation-branch-remove",
		leaf = "mutation-leaf",
		leafAdd = "mutation-leaf-add",
		leafRemove = "mutation-leaf-remove"
	}
	
	/**
	 * A symbol which may be applied as an object key in 
	 * a type, in order to make it a valid Reflex atom.
	 */
	export declare const atom: unique symbol;
	(<any>Reflex)["atom"] = typeof Symbol === "function" ?
		Symbol("Reflex.atom") :
		"Reflex.atom";
	
	/**
	 * A type that identifies the types of atoms that can exist
	 * in any reflexive arguments list.
	 * 
	 * @param B The library's Branch type.
	 * @param L The library's Leaf type.
	 * @param X Extra types understood by the library.
	 */
	export type Atom<B extends object = object, L = any, X = void> =
		B |
		L |
		X |
		false |
		null |
		void |
		SymbolicAtom<B, L, X> |
		Iterable<Atom<B, L, X>> |
		AsyncIterable<Atom<B, L, X>> |
		Promise<Atom<B, L, X>> |
		((branch: B, children: (B | L)[]) => Atom<B, L, X>) |
		Core.BranchFunction |
		Recurrent |
		IAttributes;
	
	/**
	 * An interface for an object that has it's own atomization
	 * process.
	 */
	export interface SymbolicAtom<B extends object = object, L = any, X = void>
	{
		readonly [atom]: Atom<B, L, X>;
	}
	
	/** */
	export interface IAttributes<T = string | number | bigint | boolean>
	{
		[attributeName: string]: Core.Voidable<T> | StatefulForce<Core.Voidable<T>>;
	}
	
	/**
	 * Generic function definition for callback functions provided to
	 * the global on() function.
	 */
	export type RecurrentCallback<T extends Atom = Atom> = (...args: any[]) => T;
}

declare namespace Reflex.Core
{
	/**
	 * Marker interface that defines an object that can have
	 * reflexive values attached to it.
	 * (For example: HTMLElement or NSWindow)
	 */
	export interface IBranch extends Object { }
	
	/** */
	export class BranchFunction<TName extends string = string>
	{
		readonly name: TName;
		private readonly nominal: undefined;
	}
	
	/**
	 * Marker interface that defines an object that represents
	 * a block of visible leaves (content) in the tree.
	 * (For example: the W3C DOM's Text object)
	 */
	export interface ILeaf extends Object { }
	
	/** */
	export type Voidable<T> = 
		T |
		false |
		null |
		void;
	
	/**
	 * Abstract definition of the leaf variant of the top-level
	 * namespace function.
	 * 
	 * @param L The Leaf type of the library.
	 * @param S The "Leaf source" type, which are the other types
	 * (typically primitives) that the library is capable of converting
	 * into it's Leaf type.
	 */
	export interface ILeafNamespace<L = any, S = string | number | bigint>
	{
		(
			template:
				TemplateStringsArray | 
				L | S | void |
				StatefulForce,
			
			...values: (
				IBranch | 
				L | S | void |
				StatefulForce)[]
		): L;
	}
	
	/**
	 * Abstract definition of the branch variant of the top-level
	 * namespace function.
	 * 
	 * @param A The Atom type of the Reflexive library.
	 * @param R The return type of the root-level branch function.
	 */
	export interface IBranchNamespace<A = any, R = any>
	{
		(...atoms: A[]): R;
	}
	
	/**
	 * Defines a relative or specific meta reference, used for indicating
	 * an insertion position of a new meta within a Reflexive tree.
	 */
	export type Ref<B = IBranch, L = ILeaf> = B | L | "prepend" | "append";
	
	/**
	 * A mapped type that extracts the names of the methods and
	 * function-valued fields out of the specified type.
	 */
	export type MethodNames<T> = {
		[K in keyof T]: T[K] extends ((...args: any[]) => any) ? K : never;
	}[keyof T];

	/**
	 * Extracts any return type from the specified type, in the case
	 * when the type specified is a function.
	 */
	export type MaybeReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
	
	/**
	 * Maps the specified type to a version of itself,
	 * but without any possibly undefined values.
	 */
	export type Defined<T> = { [K in keyof T]-?: T[K] };
	
	/**
	 * Extracts the return type of the specified function type.
	 */
	export type ReturnOf<original extends Function> = 
		original extends (...x: any[]) => infer returnType ?
			returnType : 
			never;
	
	/**
	 * Extracts the methods out of the type, and returns a mapped object type
	 * whose members are transformed into branch creation methods.
	 */
	export type AsBranches<T> = {
		readonly [K in keyof T]: AsBranch<T[K]>
	};
	
	/**
	 * Extracts 
	 */
	export type AsBranch<F> = 
		F extends () => infer R ? (...atoms: Atom[]) => R :
		F extends (...args: infer A) => infer R ? (...args: A) => (...atoms: Atom[]) => R :
		F;
	
	/**
	 * 
	 */
	export type StaticBranchesOf<L extends Reflex.Core.ILibrary> =
		L["getStaticBranches"] extends Function ?
			AsBranches<ReturnOf<L["getStaticBranches"]>> :
			{};
	
	/**
	 * 
	 */
	export type StaticNonBranchesOf<L extends Reflex.Core.ILibrary> =
		L["getStaticNonBranches"] extends Function ?
			AsBranches<ReturnOf<L["getStaticNonBranches"]>> :
			{};
}

