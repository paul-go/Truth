import * as X from "./X";
import * as Truth from "truth-compiler";

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
