
namespace make
{
	/** */
	export interface IModulizeOptions
	{
		exports?: string | string[];
		globalize?: true | string[];
		above?: string;
		below?: string
	}
	
	/**
	 * Converts the specified JavaScript file to a format that is
	 * both a CommonJS-compatible module, as well as a file
	 * that emits globals in a browser context. Identifiers defined
	 * in the script are also encapsulated into a closure, and
	 * only the specified exports are made global.
	 * 
	 * @param path The path to the file to overwrite.
	 * @param exports A series of variables defined within the file
	 * specified at the `path`, that should be made available in
	 * the global scope.
	 */
	export function modulize(path: string, options?: IModulizeOptions)
	{
		const originalCode = Fs.readFileSync(path).toString("utf8");
		const exports: string[] = [options && options.exports || []].flat();
		const above = options && options.above || "";
		const below = options && options.below || "";
		
		const headerInsertPos = (() =>
		{
			const us = `"use strict";`;
			const pos = originalCode.indexOf(us);
			return pos < 0 ? 0 : pos + us.length;
		})();
		
		const header = (() =>
		{
			const out: string[] = [];
			
			if (above)
				out.push(above);
			
			if (exports.length)
				out.push("var " + exports.join() + ";");
			
			out.push(
				"(function() {",
					"var __ = (function() {"
			);
			
			return out.join("");
		})();
		
		const footerInsertPos = (() =>
		{
			const sm = "\n//# sourceMappingURL=";
			const pos = originalCode.lastIndexOf(sm);
			return pos < 0 ? originalCode.length : pos;
		})();
		
		const footer = (() =>
		{
			const out: string[] = [];
			
			if (exports.length)
				out.push(";return [" + exports.join()  + "];");
			
			// For the var _
			out.push("})();");
			
			// Assign the array values to the final globals
			for (let i = -1; ++i < exports.length;)
				out.push(exports[i] + ` = __[${i}];`);
			
			if (exports.length)
			{
				const objText = exports.map(s => s + ": " + s).join();
				out.push(`if (typeof module === "object") module.exports = { ${objText} };`);
			}
			
			// From the top-level closure
			out.push("})();");
			
			if (below)
				out.push(below);
			
			return out.join("");
		})();
		
		const newCode = 
			originalCode.slice(0, headerInsertPos) +
			header +
			originalCode.slice(headerInsertPos, footerInsertPos) +
			footer +
			originalCode.slice(footerInsertPos);
		
		Fs.writeFileSync(path, newCode);
	}
}
