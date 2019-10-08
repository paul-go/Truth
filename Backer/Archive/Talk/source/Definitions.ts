namespace Reflex.Talk
{
	/**
	 * JS values that can be used to reference Truth types.
	 */
	export type TypePrimitive =
		| Truth.Type
		| PLABase
		| typeof Number
		| typeof String;
	
	/**
	 * Base types for PLAs emitted by the Backer.
	 */
	export interface PLABase {
		typePath: string[];
	}

	/**
	 * Type of `ref` parameter in Branch's attach method.
	 */
	export type AttachRef<T = unknown> = T | "prepend" | "append";

	/**
	 * A branch which can be used in Reflex.
	 */
	export interface TalkBranch<T = TypePrimitive | Operation> {
		/**
		 * Attach a new node to the current branch.
		 */
		attach(node: T, ref: AttachRef<T>): void;

		/**
		 * Removes the first occurrence of the given node from the current branch.
		 *
		 * @returns {boolean} Returns a boolean indicating if any node was removed.
		 */
		detach(node: T): boolean;

		/**
		 * Returns a list of all the attached values in this branch.
		 */
		getChildren(): T[];
	}

	export interface Namespace {
		/**
		 * Constructs a new Query.
		 */
		(
			...primitives: Core.Primitives<Operation | TypePrimitive, never, never>[]
		): Promise<Query>;

		/**
		 * A TruthTalk `is(type)` operation.
		 * Reduces the set of cursors to online include those that point to types
		 * that exactly match the type specified (without considering covariance or
		 * contravariance).
		 */
		is(
			type: Core.Primitives<TypePrimitive, Operations.Is, never>
		): Operations.Is;

		/**
		 * Negation.
		 */
		not(
			...primitives: Core.Primitives<Operation, Operations.Not, never>[]
		): Operations.Not;

		/**
		 * Creates a logical OR operation between all passed operations.
		 */
		or(
			...primitives: Core.Primitives<Operation, Operations.Or, never>[]
		): Operations.Or;

		/**
		 * Reduces the set of cursors to only include those that point to types that
		 * match the specified set of operations. A has() operation matches one
		 * single content type.
		 */
		has(
			...primitives: Core.Primitives<
				Operation | TypePrimitive,
				Operations.Has,
				never
			>[]
		): Operations.Has;

		/**
		 * Filter cursors by those whose aliases are greater than the specified
		 * value, using a lexicographical comparison. Also worth noting is that
		 * "less than or equal" is achieved by wrapping this function in a tt.not()
		 * call.
		 */
		greaterThan(
			value: Core.Primitives<string | number, Operations.GreaterThan, never>
		): Operations.GreaterThan;

		/**
		 * Filter cursors by those whose aliases are less than the specified value,
		 * using a lexicographical comparison. Also worth noting is that "greater
		 * than or equal" is achieved by wrapping this function in a tt.not() call.
		 */
		lessThan(
			value: Core.Primitives<string | number, Operations.LessThan, never>
		): Operations.LessThan;

		/** */
		equals(
			value: Core.Primitives<string | number, Operations.Equals, never>
		): Operations.Equals;
	}
}
