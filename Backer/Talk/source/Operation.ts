/**
 * An operation that transforms collected data in a query.
 */
export abstract class Operation 
{
	/**
	 * Returns a new array including a subset of the input data.
	 */
	abstract transform(types: Truth.Type[]): Truth.Type[];
}

/**
 * Helper abstract class to implement operations that decide about keeping a
 * type in the collected data or not. (e.g. `equals`)
 */
export abstract class FilterOperation extends Operation 
{
	/**
	 * Operation transform function.
	 */
	transform(types: Truth.Type[]): Truth.Type[] 
	{
		return types.filter(type => this.include(type));
	}

	/**
	 * Returns a boolean indicating if this Truth object must stay in the
	 * collected data.
	 */
	abstract include(type: Truth.Type): boolean;
}
