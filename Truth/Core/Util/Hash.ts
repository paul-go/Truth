
namespace Truth
{
	/**
	 * A class that encapsulates string hashing functionality.
	 */
	export const Hash = new class Hash
	{
		/** Stores the constant number of characters in a returned hash. */
		readonly length = 8;
		
		/**
		 * Calculates a hash code from the specified string.
		 */
		calculate(text: string)
		{
			if (text.length === 0)
				return "0".repeat(8);
			
			let hash = 0;
			for (let i = -1; ++i < text.length;)
			{
				const char = text.charCodeAt(i);
				hash = (hash << 5) - hash + char;
				hash %= 2 ** 32;
			}
			
			return (hash + Math.pow(2, 31)).toString(16).toUpperCase();
		}
	}();
}
