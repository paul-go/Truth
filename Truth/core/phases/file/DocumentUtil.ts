
namespace Truth
{
	/**
	 * @internal
	 * A utilities object that offloads some of the isolatable functionality from 
	 * the Document object (in an effort to keep it's growing size under control).
	 */
	export namespace DocumentUtil
	{
		/**
		 * Generator function that yields all statements (unparsed lines)
		 * of the given source text. 
		 */
		export function *readLines(source: string)
		{
			let cursor = -1;
			let statementStart = 0;
			const char = () => source[cursor];
			
			for (;;)
			{
				if (cursor >= source.length - 1)
					return yield source.slice(statementStart);
				
				cursor++;
				
				if (char() === Syntax.terminal)
				{
					yield source.slice(statementStart, cursor);
					statementStart = cursor + 1;
				}
			}
		}
		
		/**
		 * Performs the integer bounding and wrapping formula that is
		 * common on all positional arguments found in JavaScript array
		 * and string methods (such as Array.slice).
		 */
		export function applyBounds(index: number, length: number)
		{
			if (index === 0 || length === 0)
				return 0;
			
			if (index > 0)
				return Math.min(index, length - 1);
			
			if (index < 0)
				return Math.max(length + index, 0);
			
			throw Exception.unknownState();
		}
	}
}
