import * as X from "./X";

export function isPLA(obj: any): obj is X.PLABase 
{
	return obj && typeof obj === "object" && Array.isArray(obj.typePath);
}

export function toType(type: X.TypePrimitive): Truth.Type 
{
	if (type instanceof Truth.Type) return type;
	if (type === Number) return toType({ typePath: ["Number"] });
	if (type === String) return toType({ typePath: ["String"] });
	if (!isPLA(type)) throw new Error("Expected PLA.");
	const result = X.System.this.doc.query(...type.typePath);
	if (!result) throw new Error("Cannot resolve PLA.");
	return result;
}
