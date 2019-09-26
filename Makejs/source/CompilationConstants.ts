namespace make 
{
	/**
	 * Performs a simple in-place find/replace of compilation constants on
	 * an input JavaScript file.
	 *
	 * Code being replaced should use raw string values such as "MODERN"
	 * or "BROWSER", which resolve to truthy values. If the corresponding
	 * constant value in the constants parameter to this function is set to
	 * true, the string is replaced with 0*1111..., where the number of 1's
	 * is equal to the character length of the constant. This is a falsy value.
	 *
	 * The replaced falsy values are then identified as dead code by terser,
	 * which subsequently causes the code to be removed.
	 */
	export function compilationConstants( 
		file: string, 
		constants: { [key: string]: boolean }) 
	{
		let content = Fs.readFileSync(file, "utf8"); 
		for (const key in constants) 
		{ 
			if (constants[key]) continue; 
			const k = "1".repeat(key.length); 
			content = content.replace(new RegExp(`\"${key}\"`, "g"), key => `0*${k}`); 
		} 
		Fs.writeFileSync(file, content); 
	}
}
