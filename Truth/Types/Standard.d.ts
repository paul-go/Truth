
declare global
{
	/** */
	type Constructor<T> = { new(...args: any[]): T };
	
	/** Omit the members named in the second type from the first. */
	type Omit<T, TNames> = Pick<T, Exclude<keyof T, TNames>>;
	
	/** Subtract the members of the second type from the first. */
	type Subtract<T, TSubtract> = Pick<T, Exclude<keyof T, keyof TSubtract>>;
	
	/** */
	interface ObjectConstructor
	{
		entries<T>(o: { [s: string]: T }): [string, T][];
		entries(o: any): [string, any][];
	}
}

export { }
