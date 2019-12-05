
namespace Truth
{
	/**
	 * Utility class for performing basic guarding.
	 */
	export class Not
	{
		/**
		 * @returns The argument as specified, but throws an
		 * exception in the case when it's strictly equal to null.
		 */
		static null<T>(param: T): NotNull<T>
		{
			if (param === null)
			{
				debugger;
				throw new ReferenceError();
			}
			
			return <NotNull<T>>param;
		}
		
		/**
		 * @returns The argument as specified, but throws an
		 * exception in the case when it's strictly equal to undefined.
		 */
		static undefined<T>(param: T): NotUndefined<T>
		{
			if (param === undefined)
			{
				debugger;
				throw new ReferenceError();
			}
			
			return <NotUndefined<T>>param;
		}
		
		/**
		 * @returns The argument as specified, but throws an
		 * exception in the case when it's null or undefined.
		 */
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
}
