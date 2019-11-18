
namespace make
{
	/**
	 * (UNTESTED)
	 * 
	 * Unwraps calls to the eval() function, whose only parameter is a string literal, 
	 * into the string contents itself. This is useful for hiding JS code in TypeScript
	 * files that shouldn't be visible to TypeScript.
	 * 
	 * The implementation is naive in that it only recognizes string literals that use
	 * the double quote (") mark, and escaped quotes inside the string literal are
	 * not supported.
	 */
	export function uneval(filePath: string)
	{
		let contents = Fs.readFileSync(filePath).toString("utf8");
		const evalOpen = `eval("`;
		const evalClose = `")`;
		let pos = 0;
		
		for (;;)
		{
			const openPos = contents.indexOf(evalOpen, pos);
			if (openPos < 0)
				break;
			
			const closePos = contents.indexOf(evalClose, openPos);
			if (closePos < 0)
				throw new Error("Invalid JavaScript detected.");
			
			contents = 
				contents.slice(0, openPos) + 
				" ".repeat(evalOpen.length) + 
				contents.slice(openPos + evalOpen.length);
			
			contents = 
				contents.slice(0, closePos) + 
				" ".repeat(evalClose.length) + 
				contents.slice(closePos + evalClose.length);
		}
		
		Fs.writeFileSync(filePath, contents);
	}
}
