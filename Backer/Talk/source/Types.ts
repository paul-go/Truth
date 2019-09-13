import * as X from "./X";

export type TypePrimitive =
	| Truth.Type
	| PLABase
	| typeof Number
	| typeof String;

export interface PLABase {
	typePath: string[];
}

export interface Branch<T = TypePrimitive | X.Operation> {
	attach(typePrimitive: T): void;
	detach(typePrimitive: T): boolean;
}
