
namespace CoverTruth
{
	/**
	 * 
	 */
	export async function createDocument(...lines: string[]): Promise<Truth.Document>;
	export async function createDocument(program: Truth.Program, ...lines: string[]): Promise<Truth.Document>;
	export async function createDocument(arg: Truth.Program | string, ...lines: string[])
	{
		let program: Truth.Program;
		
		if (typeof arg === "string")
		{
			lines.unshift(arg);
			program = new Truth.Program();
		}
		else
		{
			program = arg;
		}
		
		const sourceText = lines.join(Truth.Syntax.terminal);
		const doc = await program.addDocument(sourceText);
		if (doc instanceof Error)
			throw Truth.Exception.unknownState();
		
		await program.wait();
		return doc;
	}
	
	/**
	 * 
	 */
	export async function createLanguageCover(): 
		Promise<[Truth.Program]>;
	/**
	 * 
	 */
	export async function createLanguageCover(sourceA: string): 
		Promise<[Truth.Document, Truth.Program]>;
	/**
	 * 
	 */
	export async function createLanguageCover(sourceA: string, sourceB: string): 
		Promise<[Truth.Document, Truth.Document, Truth.Program]>;
	/**
	 * 
	 */
	export async function createLanguageCover(sourceA: string, sourceB: string, sourceC: string): 
		Promise<[Truth.Document, Truth.Document, Truth.Document, Truth.Program]>;
	
	export async function createLanguageCover(sourceA?: string, sourceB?: string, sourceC?: string)
	{
		const program = new Truth.Program();
		const documents: Truth.Document[] = [];
		
		if (typeof sourceA === "string")
		{
			const docA = await program.addDocument(outdent`${sourceA}`);
			if (docA instanceof Error)
			{
				debugger;
				throw docA;
			}
			
			documents.push(docA);
		}
		
		if (typeof sourceB === "string")
		{
			const docB = await program.addDocument(outdent`${sourceB}`);
			if (docB instanceof Error)
			{
				debugger;
				throw docB;
			}
			
			documents.push(docB);
		}
		
		if (typeof sourceC === "string")
		{
			const docC = await program.addDocument(outdent`${sourceC}`);
			if (docC instanceof Error)
			{
				debugger;
				throw docC;
			}
			
			documents.push(docC);
		}
		
		return [...documents, program];
	}
	
	/**
	 * Extracts one or more types from the specified document, at the given paths.
	 * An error is thrown in the case when any of the paths specified do not correspond
	 * to a type.
	 */
	export function typesOf(
		document: Truth.Document,
		...typePaths: (string | string[])[]): Truth.Type[]
	{
		const out: (Truth.Type | null)[] = [];
		const paths = typePaths.map(v => typeof v === "string" ? [v] : v);
		let hasError = false;
		
		for (const path of paths)
		{
			const type = document.query(...path);
			if (type instanceof Truth.Type)
			{
				out.push(type);
			}
			else
			{
				hasError = true;
				out.push(null);
			}
		}
		
		if (hasError)
		{
			const errorLines = ["No type found at paths:"];
			
			for (let i = -1; ++i < out.length;)
				if (out[i] === null)
					errorLines.push("\t" + paths[i].join("/"));
			
			throw new Error(errorLines.join("\n"));
		}
		
		return out as Truth.Type[];
	}
	
	/**
	 * @returns Whether the specified array of statements reads like a 
	 * certain string, when the contents of the statement are concatenated
	 * into lines, and the common indentation in the lines of the specified
	 * string is removed.
	 */
	export function hasContent(
		statements: Truth.Document | readonly Truth.Statement[] | null,
		...expected: string[])
	{
		const statementStrs: string[] = [];
		
		if (Array.isArray(statements))
		{
			statementStrs.push(...statements.map(smt => smt.toString()));
		}
		else if (statements instanceof Truth.Document)
		{
			for (const smt of statements.eachStatement())
				statementStrs.push(smt.sourceText);
		}
		else return "Invalid input.";
		
		if (statementStrs.length !== expected.length)
			return false;
		
		for (const [idx, str] of statementStrs.entries())
			if (str !== expected[idx])
				return false;
		
		return true;
	}
	
	/**
	 * Removes the indentation common to every line in the specified, 
	 * so that Truth source code can be processed as if
	 * there isn't a universal indent applied to every line.
	 */
	export function outdent(literals: TemplateStringsArray, ...placeholders: string[])
	{
		let result = "";
		
		for (let i = -1; ++i < placeholders.length;)
			result += literals[i] + placeholders[i];
		
		result += literals[literals.length - 1];
		const lines = result.split("\n");
		
		// Remove all leading whitespace-only lines.
		while (lines.length && lines[0].trim() === "")
			lines.shift();
		
		// Cut off whitespace-only trailing lines
		while (lines.length && lines[lines.length - 1].trim() === "")
			lines.pop();
		
		// Find the first non whitespace line with the least amount 
		// of indent, and use it as the universal indent trimmer.
		let minIndent = Number.MAX_SAFE_INTEGER;
		
		for (let i = -1; ++i < lines.length;)
		{
			const line = lines[i];
			if (line.trim() === "")
				continue;
			
			const size = line.length - line.replace(/^\s*/, "").length;
			if (size < minIndent)
				minIndent = size;
		}
		
		// Slice off the left side of the string.
		if (minIndent > 0 && minIndent !== Number.MAX_SAFE_INTEGER)
			for (let i = -1; ++i < lines.length;)
				lines[i] = lines[i].slice(minIndent);
		
		return lines.join("\n");
	}
}
