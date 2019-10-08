namespace Reflex.Talk
{
	/**
	 * Checks whatever an Object is a Truth PLA or not.
	 */
	export function isPLA(obj: any): obj is PLABase 
	{
		return obj && typeof obj === "object" && Array.isArray(obj.typePath);
	}

	/**
	 * Converts a type primitive to a Truth type in the System's default document.
	 */
	export function toType(type: TypePrimitive): Truth.Type 
	{
		if (type instanceof Truth.Type)
			return type;
		
		if (type === Number)
			return toType({ typePath: ["Number"] });
		
		if (type === String)
			return toType({ typePath: ["String"] });
		
		// TODO(qti3e) Support Boolean.
		if (!isPLA(type)) throw new Error("Expected PLA.");
		const result = System.this.doc.query(...type.typePath);
		if (!result) throw new Error("Cannot resolve PLA.");
		return result;
	}
}
