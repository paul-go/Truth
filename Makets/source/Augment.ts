
namespace make
{
	/** */
	export interface IAugmentOptions
	{
		/**
		 * Specifies the JavaScript identifiers that are declared within the code file
		 * that should be "returned". If an idenfier is "returned", it means that it's
		 * added to any available `module.exports` value, declared in a top-level
		 * `var` statement, and potentially added to the globalThis object, in the
		 * case when the `globals` option is set to a truthy value.
		 */
		returns?: string | string[];
		
		/**
		 * Specifies whether identifiers are added to the environment's globalThis
		 * object. 
		 * 
		 * When the provided value is `true`, the identifiers from the `returns` field
		 * are assigned as globals.
		 * 
		 * When the provided value is a string or string array, these are assumed to
		 * be names that are defined in the provided code file, which are assigned
		 * as globals.
		 */
		globals?: true | string | string[];
		
		/**
		 * Specifies whether identifiers are added to the `module.exports` value.
		 * If omitted, the the identifiers from the `returns` fields are assigned.
		 * 
		 * When the provided value is false, no module.exports value is assigned.
		 * 
		 * When the provided value is a string or string array, these are assumed to
		 * be names that are defined in the provided code file, which are assigned
		 * to the `module.exports` value.
		 */
		exports?: false | string | string[];
		
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
		 * Specifies the code, if any, to be added at the beginning of the encapsulation
		 * IIFE. Has no effect when the `encapsulate` option is set to `false`.
		 */
		encapsulatedAbove?: string;
		
		/**
		 * Specifies the code, if any, to be added at the end of the encapsulation
		 * IIFE. Has no effect when the `encapsulate` option is set to `false`.
		 */
		encapsulatedBelow?: string;
		
		/**
		 * Specifies whether the code file should be encapsulated in an IIFE.
		 * Automatically inferred as true if any of the `encapsulatedAbove`,
		 * `encapsulatedBelow`, or `returns` fields are set to non-falsey values.
		 */
		encapsulate?: true;
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
	export function augment(path: string, options: IAugmentOptions)
	{
		const originalCode = Fs.readFileSync(path).toString("utf8");
		const above = options.above || "";
		const below = options.below || "";
		const encapsulatedAbove = options.encapsulatedAbove || "";
		const encapsulatedBelow = options.encapsulatedBelow || "";
		const returns: string[] = [options.returns || []].flat();
		
		const globals =
			options.globals === true ? returns :
			typeof options.globals === "string" ? [options.globals] :
			Array.isArray(options.globals) ? options.globals :
			[];
		
		const exports = 
			options.exports === false ? [] :
			typeof options.exports === "string" ? [options.exports] :
			Array.isArray(options.exports) ? options.exports :
			returns;
		
		const retVar = "__ret";
		
		const encapsulate = 
			options.encapsulate ||
			!!(encapsulatedAbove || encapsulatedBelow || returns.length);
		
		const toObject = (names: string[]) =>
			"{ " + names.map(n => n + ": " + n).join() + " }";
		
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
				if (returns.length === 1)
					out.push(`var ${returns[0]} = `);
				
				else if (returns.length > 1)
					out.push(`var ${retVar} = `);
				
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
				out.push(exports.length > 1 ?
					`if (typeof module === "object") module.exports = ${toObject(exports)};` :
					`module.exports = ${exports[0]};`);
			}
			
			if (globals.length)
			{
				const globalCode = 
					`typeof navigator === "object" ? window : ` +
					`typeof global === "object" ? global : {}`;
				
				out.push(returns.length > 1 ?
					`Object.assign(${globalCode}, ${toObject(globals)});` :
					`(${globalCode}).${globals[0]} = ${globals[0]};`);
			}
			
			if (encapsulate)
			{
				if (encapsulatedBelow)
					out.push(encapsulatedBelow);
				
				if (returns.length === 1)
					out.push(`return ${returns[0]};`);
				
				else if (returns.length > 1)
					out.push(`return [${returns.join()}];`);
				
				out.push("})()");
				
				if (returns.length > 1)
					out.push(...returns.map((r, i) => `, ${r} = ${retVar}[${i}]`));
				
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
