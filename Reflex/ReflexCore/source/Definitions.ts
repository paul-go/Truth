
namespace Reflex
{
	/** */
	export enum mutation
	{
		any = "mutation-any",
		branch = "mutation-branch",
		branchAdd = "mutation-branch-add",
		branchRemove = "mutation-branch-remove",
		content = "mutation-content",
		contentAdd = "mutation-content-add",
		contentRemove = "mutation-content-remove"
	}
}

declare namespace Reflex.Core
{
	/** */
	export type Voidable<T> = 
		T |
		false |
		void;
	
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
	 * a block of visible content in the tree.
	 * (For example: the W3C DOM's Text object)
	 */
	export interface IContent extends Object { }
	
	/**
	 * A type that identifies the primitive types that can exist
	 * in any reflexive arguments list.
	 */
	export type Primitive<TMeta = object, TBranch = object, TAdditionals = unknown> =
		Voidable<TMeta | TAdditionals> |
		Iterable<TMeta | TAdditionals> |
		AsyncIterable<TMeta | TAdditionals> |
		Promise<TMeta | TAdditionals> |
		((branch: TBranch, children: TMeta[]) => Primitives<TMeta, TBranch, TAdditionals>) |
		BranchFunction |
		Recurrent | 
		IAttributes;
	
	/**
	 * 
	 */
	export type Primitives<M = object, B = object, A = unknown> =
		M |
		B |
		A |
		Primitive<M, B, A> |
		Primitive<M, B, Primitive<M, B, A>> |
		Primitive<M, B, Primitive<M, B, Primitive<M, B, A>>> |
		Primitive<M, B, Primitive<M, B, Primitive<M, B, Primitive<M, B, A>>>>;
	
	/** */
	export interface IAttributes<T = string | number | bigint | boolean>
	{
		[attributeName: string]: Voidable<T> | StatefulForce<Voidable<T>>;
	}
	
	/**
	 * Abstract definition of the content variant of the top-level
	 * namespace function.
	 */
	export interface IContentNamespace<TPreparedContent, TContent>
	{
		(
			template:
				TemplateStringsArray | 
				Voidable<TContent> | 
				StatefulForce<Voidable<TContent>>,
			
			...values: (
				IBranch | 
				Voidable<TContent> | 
				StatefulForce<Voidable<TContent>>)[]
		): TPreparedContent;
	}
	
	/**
	 * Abstract definition of the container variant of the top-level
	 * namespace function.
	 */
	export interface IContainerNamespace<P extends Primitives, TResult = object>
	{
		(...primitives: P[]): TResult;
	}
	
	/**
	 * Defines a relative or specific meta reference, used for indicating
	 * an insertion position of a new meta within a Reflexive tree.
	 */
	export type Ref = IBranch | IContent | "prepend" | "append";
	
	/**
	 * Generic function definition for callback functions provided to
	 * the global on() function.
	 */
	export type RecurrentCallback<T extends Primitives = Primitives> = (...args: any[]) => T;
	
	/**
	 * 
	 */
	export type ObjectForce<T> = {
		[P in keyof T]:
			T[P] extends (string | number | bigint | boolean | null) ? StatefulForce<T[P]> :
			T[P] extends Array<infer U> ? ArrayForce<U> :
			T[P];
	}
	
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
		[K in keyof T]: AsBranch<T[K]>
	};
	
	/**
	 * Extracts 
	 */
	export type AsBranch<F> = 
		F extends () => infer R ? (...primitives: Primitives[]) => R :
		F extends (...args: infer A) => infer R ? (...args: A) => (...primitives: Primitives[]) => R :
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
