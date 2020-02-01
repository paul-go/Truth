
namespace Truth
{
	/**
	 * @internal
	 * Utility class for performing basic guarding.
	 */
	export class Not
	{
		/**
		 * @returns The argument as specified, but throws an
		 * exception in the case when it's strictly equal to null.
		 */
		static null<T>(param: T)
		{
			if (param === null)
			{
				debugger;
				throw new ReferenceError();
			}
			
			return param as NotNull<T>;
		}
		
		/**
		 * @returns The argument as specified, but throws an
		 * exception in the case when it's strictly equal to undefined.
		 */
		static undefined<T>(param: T)
		{
			if (param === undefined)
			{
				debugger;
				throw new ReferenceError();
			}
			
			return param as NotUndefined<T>;
		}
		
		/**
		 * @returns The argument as specified, but throws an
		 * exception in the case when it's null or undefined.
		 */
		static nullable<T>(param: T)
		{
			if (param === null || param === undefined)
			{
				debugger;
				throw new ReferenceError();
			}
			
			return param as NotNull<T> | NotUndefined<T>;
		}
	}

	type NotNull<T> = T extends null ? never : T;
	type NotUndefined<T> = T extends undefined ? never : T;
}
