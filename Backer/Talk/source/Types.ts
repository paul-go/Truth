namespace Reflex.Talk {
	export type TypePrimitive =
		| Truth.Type
		| PLABase
		| typeof Number
		| typeof String;

	export interface PLABase {
		typePath: string[];
	}

	export type AttachRef<T = unknown> = T | "prepend" | "append";

	export interface Branch<T = TypePrimitive | Operation> {
		attach(typePrimitive: T, ref: AttachRef<T>): void;
		detach(typePrimitive: T): boolean;
	}
}
