
namespace make
{
	/** */
	export interface IAugmentOptions
	{
		/**
		 * Specifies the identifier or identifiers defined within the
		 * code file should be added to the `module.exports` object.
		 */
		exports?: string | string[];
		
		/**
		 * Specifies the identifier or identifiers defined within the
		 * code file should be added to the global object (`window`
		 * in browser-compatible environments, or `global` in NodeJS).
		 */
		globals?: string | string[];
		
		/**
		 * Specifies the code, if any, to be added at the beginning of the file.
		 * If the file starts with a hashbang or a "use strict" directive, the content
		 * is placed immediately after these.
		 */
		above?: string;
		
		/**
		 * Specifies the code, if any, to be added at the end of the file.
		 */
		below?: string;
		
		/**
		 * Specifies whether the code file should be encapsulated in an IIFE.
		 */
		encapsulate?: boolean;
		
		/**
		 * Specifies the JavaScript identifier (or set of identifiers) defined within
		 * the code block that should be cherry picked and declared as top-level
		 * variables,outside of the encapsulation function block. Has no effect
		 * when the `encapsulate` option is set to `false`.
		 */
		encapsulatedReturns?: string | string[];
		
		/**
		 * Specifies the code, if any, to be added at the beginning of the encapsulation
		 * IIFE. Has no effect when the `encapsulate` option is set to `false`.
		 */
		encapsulatedAbove?: string;
		
		/**
		 * Specifies the code, if any, to be added at the end of the encapsulation
		 * IIFE. Has no effect when the `encapsulate` option is set to `false`.
		 */
		encapsulatedBelow?: string;
	}
	
	/**
	 * Augments a file (typically a code file) via content-aware change
	 * operations.
	 * 
	 * Can be used to convert the a JavaScript file to a format that is
	 * both a CommonJS-compatible module, as well as a file
	 * that emits globals in a browser context. Identifiers defined
	 * in the script are also encapsulated into a closure, and
	 * only the specified exports are made global.
	 * 
	 * @param path The path to the file to overwrite.
	 * @param options See documentation for `IAugmentOptions`.
	 */
	export function augment(path: string, options?: IAugmentOptions)
	{
		const originalCode = Fs.readFileSync(path).toString("utf8");
		const exports: string[] = [options && options.exports || []].flat();
		const globals: string[] = [options && options.exports || []].flat();
		const above = options && options.above || "";
		const below = options && options.below || "";
		const encapsulate = !!(options && options.encapsulate);
		const encapsulatedAbove = encapsulate && options!.encapsulatedAbove || "";
		const encapsulatedBelow = encapsulate && options!.encapsulatedBelow || "";
		const encapsulatedReturns: string[] = [options && options.encapsulatedReturns || []].flat();
		
		const headerInsertPos = (() =>
		{
			let pos = 0;
			
			// Account for hashbags
			if (originalCode.startsWith("#!/"))
				pos = originalCode.indexOf("\n") + 1;
			
			// Account for use strict directives
			const us = `"use strict";`;
			if (originalCode.substr(pos, us.length) === us)
				pos += us.length;
			
			return pos;
		})();
		
		const header = (() =>
		{
			const out: string[] = [];
			
			if (above)
				out.push(above);
			
			if (encapsulate)
			{
				if (encapsulatedReturns.length === 1)
					out.push(`var ${encapsulatedReturns[0]} = `);
				
				else if (encapsulatedReturns.length > 1)
					out.push(`var __eret = `);
				
				out.push("(function(){");
			
				if (encapsulatedAbove)
					out.push(encapsulatedAbove);
			}
			
			return out.join("");
		})();
		
		const footerInsertPos = (() =>
		{
			const smu = ["\n//# ", "sourceMappingURL="].join("");
			const pos = originalCode.lastIndexOf(smu);
			return pos < 0 ? originalCode.length : pos;
		})();
		
		const footer = (() =>
		{
			const out: string[] = [];
			
			if (exports.length)
			{
				const objText = exports.map(s => s + ": " + s).join();
				out.push(`if (typeof module === "object") module.exports = { ${objText} };`);
			}
			
			if (globals.length)
			{
				out.push(
					`(function() {` +
					`var g = ` +
					`typeof window !== "undefined" ? window : ` +
					`typeof global !== "undefined" ? global : null; ` +
					`if (g) ${globals.map(g => `g.${g} = ${g}`).join(",")} ` +
					`})();`
				);
			}
			
			if (encapsulate)
			{
				if (encapsulatedBelow)
					out.push(encapsulatedBelow);
				
				if (encapsulatedReturns.length === 1)
					out.push(`return ` + encapsulatedReturns[0]);
				
				else if (encapsulatedReturns.length > 1)
					out.push(`return [${encapsulatedReturns.join()}]`);
				
				out.push("})()");
				
				if (encapsulatedReturns.length > 1)
					out.push(...encapsulatedReturns.map((v, i) => `, ${v} = __evar[${i}]`));
				
				out.push(";");
			}
			
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
