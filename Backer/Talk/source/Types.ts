namespace Reflex.Talk {
	export type TypePrimitive =
		| Truth.Type
		| PLABase
		| typeof Number
		| typeof String;

	export interface PLABase {
		typePath: string[];
	}

	export interface Branch<T = TypePrimitive | Operation> {
		attach(typePrimitive: T): void;
		detach(typePrimitive: T): boolean;
	}
}
