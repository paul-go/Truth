
/**
 * Utility class for performing basic guarding.
 */
export class Guard
{
	/** */
	static null<T>(param: T): NotNull<T>
	{
		if (param === null)
		{
			debugger;
			throw new ReferenceError();
		}
		
		return <NotNull<T>>param;
	}
	
	/** */
	static undefined<T>(param: T): NotUndefined<T>
	{
		if (param === undefined)
		{
			debugger;
			throw new ReferenceError();
		}
		
		return <NotUndefined<T>>param;
	}
	
	/** */
	static nullable<T>(param: T): NotNull<T> | NotUndefined<T>
	{
		if (param === null || param === undefined)
		{
			debugger;
			throw new ReferenceError();
		}
		
		return <NotNull<T> | NotUndefined<T>>param;
	}
}

type NotNull<T> = T extends null ? never : T;
type NotUndefined<T> = T extends undefined ? never : T;
