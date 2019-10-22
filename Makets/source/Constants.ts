
namespace make 
{
	/**
	 * Performs a simple in-place find/replace of compilation constants on
	 * an input JavaScript file.
	 *
	 * Code being replaced should be TypeScript const enum definitions.
	 * 
	 * The code is replaced with a value that can be statically determined
	 * as being truthy or falsey, depending on the value specified in the
	 * provided constants table. From here, dead code analysis can be
	 * used to eliminate (or keep) the flagged regions of code.
	 */
	export function constants(
		file: string,
		constants: { [key: string]: boolean })
	{
		let content = Fs.readFileSync(file, "utf8");
		
		for (const key in constants)
		{ 
			// This regular expression matches the
			// output of TypeScript's const enums,
			// when the values are numbers.
			const reg = new RegExp(`\\d+\\s/\\*\\s${key}\\s\\*/`, "g");
			const digit = constants[key] ? "1" : "0";
			
			content = content.replace(reg, key =>
			{
				return digit + "*" + "1".repeat(key.length - 2);
			});
		}
		
		Fs.writeFileSync(file, content);
	}
}
