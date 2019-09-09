import { System } from "./System";
import * as Truth from "truth-compiler";

export interface PLABase {
	typePath: string[];
}

export function toType(type: Truth.Type | PLABase): Truth.Type 
{
	if (type instanceof Truth.Type) return type;
	const result = System.this.doc.query(...type.typePath);
	if (!result) throw new Error("Cannot resolve PLA.");
	return result;
}
