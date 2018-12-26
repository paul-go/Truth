
declare global
{
	/** */
	type Constructor<T> = { new(...args: any[]): T };
	
	/** Omit the members named in the second type from the first. */
	type Omit<T, TOmit> = T extends TOmit ? never : T;
	
	/** Create a fully locked version of the type. */
	type Freeze<T> = {
		readonly [P in keyof T]: 
			T[P] extends Array<infer V> ? ReadonlyArray<V> :
			T[P] extends Map<infer K, infer V> ? ReadonlyMap<K, V> :
			T[P] extends Set<infer V> ? ReadonlySet<V> :
			T[P];
	};
	
	/** */
	interface ObjectConstructor
	{
		entries<T>(o: { [s: string]: T }): [string, T][];
		entries(o: any): [string, any][];
	}
}

export { }
