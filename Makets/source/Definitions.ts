
namespace make
{
	/**
	 * Converts the specified .d.ts file into a UMD-compatible module.
	 * The input is expected to be the compiled output of TypeScript
	 * when using namespace merging rather than modules.
	 * 
	 * @param namespace The namespace that is used in the compiled
	 * output. The namespace cannot have any "." characters in it (this
	 * is a limitation of the TypeScript compiler).
	 * 
	 * @param dtsFilePath A path to the output .d.ts file. The content
	 * of this file will be replaced after this function executes.
	 */
	export function definitions(namespace: string, dtsFilePath: string)
	{
		if (!/^[A-Za-z0-9]+$/.test(namespace))
			throw new Error("Invalid namespace: " + namespace);
		
		const fileText = Fs.readFileSync(dtsFilePath).toString("utf-8");
		const dtsLines: Line[] = fileText
			.split("\n")
			.map(text => new Line(text));
		
		for (let idx = -1; ++idx < dtsLines.length;)
		{
			let line = dtsLines[idx];
			if (line.erased)
				continue;
			
			const isNamespace = line.has("declare", "namespace");
			if (!isNamespace)
				continue;
			
			const nsIndent = line.indent + 1;
			const erase = () => dtsLines[idx].erased = true;
			
			// Cut out the namespace declaration
			erase();
			
			for (; idx < dtsLines.length; idx++)
			{
				line = dtsLines[idx];
				if (line.erased)
					continue;
				
				if (line.indent < nsIndent)
					break;
				
				if (line.indent === nsIndent)
					if (line.hasAny(
						"class", "interface", "type",
						"const", "let", "var",
						"function", "enum", "namespace"))
						line.addKeywords("export", "declare");
				
				line.indent--;
			}
			
			// Cut out the namespace closing } character
			line = dtsLines[idx];
			if (line.toString().trim() === "}")
				erase();
		}
		
		const ins = `export as namespace ${namespace};`;
		const lastLine = dtsLines[dtsLines.length - 1];
		const dtsContentLines = dtsLines.map(line => line.toString());
		
		lastLine.isSourceMapComment ?
			dtsContentLines.splice(dtsLines.length - 2, 0, ins) :
			dtsContentLines.push(ins);
		
		Fs.writeFileSync(
			dtsFilePath,
			dtsContentLines.join("\n"));
	}
	
	/** */
	class Line
	{
		/** */
		constructor(content: string)
		{
			const trimmed = content.trimLeft();
			const spaceCount = content.length - trimmed.length;
			const tsIndent = 4;
			
			this.indent = spaceCount / tsIndent | 0;
			this.indentBump = trimmed.startsWith("*") && spaceCount % tsIndent === 1;
			
			for (let i = -1, nextKeyword = ""; ++i < trimmed.length;)
			{
				const code = trimmed.charCodeAt(i);
				
				if (code === 32)
				{
					if (nextKeyword)
					{
						this.keywords.push(nextKeyword);
						nextKeyword = "";
					}
				}
				else if (code >= 97 && code <= 122)
				{
					nextKeyword += trimmed[i];
				}
				else break;
			}
			
			const length = this.keywords.map(k => k + " ").join("").length;
			this.content = trimmed.slice(length);
			
			if (content.startsWith("//# sourceMappingURL="))
				this.isSourceMapComment = true;
		}
		
		erased = false;
		indent: number;
		
		readonly isSourceMapComment: boolean = false;
		
		private readonly indentBump: boolean = false;
		private readonly keywords: string[] = [];
		private readonly content: string = "";
		
		/** */
		addKeywords(...keywords: string[])
		{
			this.keywords.unshift(...keywords);
		}
		
		/** */
		has(...keywords: string[])
		{
			return keywords.every(k => this.keywords.includes(k));
		}
		
		/** */
		hasAny(...keywords: string[])
		{
			return keywords.some(k => this.keywords.includes(k));
		}
		
		/** */
		toString()
		{
			if (this.erased)
				return "";
			
			return "\t".repeat(this.indent) +
				(this.indentBump ? " " : "") +
				this.keywords.map(k => k + " ").join("") +
				this.content;
		}
	}
}
