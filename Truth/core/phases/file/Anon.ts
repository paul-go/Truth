
namespace Truth
{
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
		
		/**
		 * Returns a string representation of the Anon object which may be used to
		 * uniquely identify it.
		 * 
		 * Each Anon object serializes differently, otherwise, problems would arise
		 * when trying to reference any of it's contained types (Ex. What specific
		 * type is being refered to in "__ANON__" in the type URI "A/B/__ANON__/C"?
		 */
		toString()
		{
			return `__ANON${this.id}__`;
		}
	}
	
	let nextId = 0;
}
