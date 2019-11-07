
namespace Reflex.SS.Emitter
{
	const Fs = <typeof import("fs")>require("fs");
	const Path = <typeof import("path")>require("path");
	(<any>global).fetch = require("node-fetch");
	
	setTimeout(async () =>
	{
		const outputDirArg = process.argv.slice(-1)[0];
		const outputDir = Path.join(process.cwd(), outputDirArg, "definitions");
		const propertiesDir = Path.join(outputDir, "properties");
		const functionsDir = Path.join(outputDir, "functions");
		const properties = await Scrape.propertiesAndComments();
		const functions = await Scrape.functions();
		
		if (!Fs.existsSync(outputDir))
			Fs.mkdirSync(outputDir);
		
		if (!Fs.existsSync(propertiesDir))
			Fs.mkdirSync(propertiesDir);
		
		if (!Fs.existsSync(functionsDir))
			Fs.mkdirSync(functionsDir);
		
		for (const [name, commentLines] of properties)
			maybeWriteCodeFile(
				propertiesDir,
				name,
				toComment(commentLines));
		
		for (const name of functions)
			maybeWriteCodeFile(
				functionsDir,
				name,
				["/** */"]);
	});
	
	/**
	 * 
	 */
	function maybeWriteCodeFile(
		dir: string,
		cssName: string,
		commentPrefix: string[])
	{
		if (cssName.startsWith("-"))
			return;
		
		const fileName = toCodeName(cssName);
		const codeName = fileName[0].toLowerCase() + fileName.slice(1);
		
		const allLines = [
			...commentPrefix,
			codeName + "(value: CssValue, ...values: CssValue[]): Command;",
			...commentPrefix,
			codeName + "(values: CssValue[][]): Command;",
		];
		
		writeCodeFile(dir, fileName, allLines);
	}
	
	/**
	 * 
	 */
	function toCodeName(cssPropertyName: string)
	{
		return cssPropertyName
			.split("-")
			.map(s => s[0].toUpperCase() + s.slice(1))
			.join("");
	}
	
	/**
	 * 
	 */
	function writeCodeFile(dir: string, nameBase: string, lines: string[])
	{
		const fileContent = [
			"",
			"declare namespace Reflex.SS",
			"{",
				"\texport interface Namespace",
				"\t{",
					...lines.map(line => "\t\t" + line),
				"\t}",
			"}",
			""
		].join("\n");
		
		const filePath = Path.join(dir, nameBase + ".ts");
		Fs.writeFileSync(filePath, fileContent, "utf8");
	}
	
	/**
	 * 
	 */
	function toComment(lines: string[])
	{
		return [
			"/**",
			...lines.map(line => " * " + line),
			" */"
		];
	}
}
