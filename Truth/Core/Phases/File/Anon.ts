
/**
 * Placeholder object to mark the position of
 * an anonymous type within a statement.
 */
export class Anon
{
	/**
	 * @internal
	 * No-op property used for debugging
	 * purposes, and also to dodge structural
	 * type compatibility bugs in TypeScript.
	 */
	readonly id = ++nextId;
	
	/** */
	toString()
	{
		return `__ANON${this.id}__`;
	}
}

let nextId = 0;
