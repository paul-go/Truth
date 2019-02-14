

// Poor mans node definitions.
declare const process: any;
declare const require: (moduleName: string) => any;
declare const module: any;
const Fs = require("fs");
const Path = require("path");


/** */
interface LineArray extends Array<Line | LineArray> { }


/** */
class DefinitionFile
{
	/** */
	static async read(path: string)
	{
		if (!path.endsWith(".d.ts"))
		{
			if (path.endsWith(".js") || path.endsWith(".ts"))
				path = path.slice(0, -3);
			
			path += ".d.ts";
		}
		
		if (!path.startsWith("/"))
			throw path + " is not absolute.";
		
		const [fileContents, error] = await readFile(path);
		
		if (error)
			throw error;
		
		if (fileContents === null)
			return null;
		
		const textLines = fileContents
			.split(/(\r)?\n/g)
			.filter(s => !!s && !!s.trim());
		
		const parsedLines: Line[] = [];
		
		for (const textLine of textLines)
		{
			const parsedLine = Line.parse(textLine);
			parsedLines.push(parsedLine);
		}
		
		return new DefinitionFile(path, parsedLines);
	}
	
	/** */
	private constructor(
		private originPath: string,
		private lines: (Line|DefinitionFile)[])
	{ }
	
	/**
	 * Goes through the entire lines property and replaces
	 * all re-export statements into DefinitionFile objects.
	 */
	async resolve()
	{
		for (let i = -1; ++i < this.lines.length;)
		{
			const currentLine = this.lines[i];
			
			if (currentLine instanceof Lines.ReExportLine)
			{
				const originPathParsed = Path.parse(this.originPath);
				const targetPathParsed = Path.parse(currentLine.path);
				const resolvedPath = Path.resolve(originPathParsed.dir, currentLine.path);
				const nestedDefinitionFile = await DefinitionFile.read(resolvedPath);
				
				if (nestedDefinitionFile)
				{
					await nestedDefinitionFile.resolve();
					this.lines[i] = nestedDefinitionFile;
				}
			}
		}
	}
	
	/** */
	emit(namespace?: string, moduleName?: string)
	{
		const lineObjects = this.collectLines();
		
		function* eachIdentifierLine()
		{
			for (const lineObject of lineObjects)
				if (lineObject instanceof IdentifierLine)
					yield lineObject;
		}
		
		const emitLines = (indent = true) =>
		{
			for (const lineObject of lineObjects)
			{
				const emitted = lineObject.emit();
				if (emitted !== null)
					lines.push((indent ? "\t" : "") + emitted);
			}
		}
		
		const lines: string[] = [];
		
		if (namespace)
		{
			lines.push("");
			lines.unshift(`declare namespace ${namespace} {`);
			
			emitLines();
			
			lines.push("}");
			lines.push("");
		}
		
		if (moduleName)
		{
			lines.push(`declare module "${moduleName}" {`);
			
			emitLines();
			
			lines.push(`}`);
			lines.push("");
		}
		
		if (!namespace && !moduleName)
		{
			emitLines(false);
		}
		
		lines.push("");
		return lines;
	}
	
	/** */
	private collectLines()
	{
		const lines: Line[] = [];
		
		for (const item of this.lines)
		{
			if (item instanceof Line)
				lines.push(item);
			
			else if (item instanceof DefinitionFile)
				lines.push(...item.collectLines());
		}
		
		return lines;
	}
}

/** */
class Line
{
	/**
	 * Factory method that returns a line from the specified text.
	 */
	static parse(text: string)
	{
		const textTrimmed = text.trim();
		
		const lineCtor: (typeof Line) | undefined = Lines.all().find(ctor =>
			ctor && 
			ctor.pattern &&
			ctor.pattern instanceof RegExp && 
			ctor.pattern.test(textTrimmed));
		
		if (!lineCtor)
			throw "Internal error";
		
		const line: Line = new lineCtor(text);
		const matchObject = <RegExpExecArray & { groups: object }>lineCtor.pattern.exec(textTrimmed);
		
		if (matchObject && matchObject.groups)
			for (const key of Object.keys(matchObject.groups))
				key in line ?
					line[key] = matchObject.groups[key] :
					Object.defineProperty(line, key, { value: matchObject.groups[key] });
		
		return line;
	}
	
	/** */
	protected constructor(text: string)
	{
		this.leadingSpaces = text.length - text.replace(/^\s+/, "").length;
		this.text = text.trim();
	}
	
	/** */
	readonly text: string;
	
	/** */
	readonly leadingSpaces: number;
	
	/** */
	get indentDepth() { return (this.leadingSpaces / 4) | 0; }
	
	/** */
	static get pattern() { return /./; }
	
	/** */
	emit()
	{
		if (this instanceof Lines.EmptyExportLine)
			return null;
		
		if (this instanceof Lines.ImportLine)
			if (this.as === "X")
				return null;
		
		const parts = ["\t".repeat(this.indentDepth)];
		
		if (this instanceof Lines.DocCommentLineMiddle)
			parts.push(" ");
		
		parts.push(this.text
			// Remove the X. references
			.replace(/<X\.(?=\w)/g, "<")
			.replace(/\(X\.(?=\w)/g, "(")
			.replace(/ X\.(?=\w)/g, " ")
			// Remove declare keyword on non-exported member
			.replace(/^declare (?=abstract|class|namespace|function|enum|type|const|let|var)/g, "")
			// Remove declare keyword on exported member
			.replace(/^export declare (?=abstract|class|namespace|function|enum|type|const|let|var)/g, "export "));
		
		// Append a space after the * to fix editor coloring
		if (this instanceof Lines.DocCommentLineMiddle && this.text === "*")
			parts.push(" ");
		
		return parts.join("");
	}
}


/** */
export interface IdentifierDeclarationLine
{
	identifier: string;
}


/** */
abstract class IdentifierLine extends Line
{
	readonly identifier: string = "";
}


namespace Lines
{
	/** */
	export function all(): (typeof Line)[]
	{
		return Object.keys(Lines).map((ctorName: string) => Lines[ctorName]);
	}
	
	/** */
	export class ImportLine extends Line
	{
		static get pattern() { return /^import \* as (?<as>\w+) from ('|")(?<path>[\.\/\w\d]+)('|");$/; }
		
		readonly as: string = "";
		
		readonly path: string = "";
	}

	/** */
	export class ReExportLine extends Line
	{
		static get pattern() { return /^export \* from ('|")(?<path>[\.\/\w\d]+)('|");$/; }
		
		readonly path: string = "";
	}

	/** */
	export class DocCommentLineSingle extends Line
	{
		static get pattern() { return /^\/\*\*.*\*\/$/; }
	}

	/** */
	export class DocCommentLineBegin extends Line
	{
		static get pattern() { return /^\/\*\*$/; }
	}

	/** */
	export class DocCommentLineMiddle extends Line
	{
		static get pattern() { return /^\*.*$/; }
	}
	
	/** */
	export class DocCommentLineEnd extends Line
	{
		static get pattern() { return /^.+\*\/$/; }
	}
	
	/** */
	export class EmptyExportLine extends Line
	{
		static get pattern() { return /^export\s*{\s*};$/; }
	}
	
	/** */
	export class ClassDeclarationLine extends IdentifierLine
	{
		static get pattern() { return /^(export )?declare(abstract )? class (?<identifier>[\w]+)( (extends|implements) [\w\.,]+)? {$/; }
	}

	/** */
	export class InterfaceDeclarationLine extends IdentifierLine
	{
		static get pattern() { return /^(export )?interface (?<identifier>[\w]+)(\sextends [\w,\s]+)? {$/; }
	}
	
	/** */
	export class EnumDeclarationLine extends IdentifierLine
	{
		static get pattern() { return /^(export )?declare( const)? enum (?<identifier>\w+) {$/; }
	}

	/** */
	export class NamespaceDeclarationLine extends IdentifierLine
	{
		static get pattern() { return /^(export )?declare namespace (?<identifier>\w+) {$/; }
	}
	
	/** */
	export class TypeDeclarationLine extends IdentifierLine
	{
		static get pattern() { return /^(export )?declare type (?<identifier>\w+)$/; }
	}
	
	/** */
	export class ConstDeclarationLine extends IdentifierLine
	{
		static get pattern() { return /^(export )?declare const (?<identifier>\w+).*$/; }
	}
	
	/** */
	export class OtherLine extends Line
	{
		static get pattern() { return /.*/; }
	}
}


/** */
const readFile = (path: string, opts = "utf8") =>
	new Promise<[string, Error | null]>((resolve, rej) =>
	{
		Fs.readFile(path, opts, (error: Error, data: string) =>
		{
			if (error)
				resolve(["", error]);
			else
				resolve([data, null]);
		});
	});


interface IBundleOptions
{
	in: string;
	out: string|string[];
	namespace: string;
	module: string;
	header: string|string[];
	footer: string|string[];
}


/** Whether the code is running as a require module, or from the command line. */
const runningAsModule = !!module.parent;


const bundle = (options?: IBundleOptions) =>
{
	/** Stores the directory containing the entry point script. */
	const scriptDirectory = (() =>
	{
		if (runningAsModule)
		{
			const args: string[] = process.argv;
			
			if (args.length < 2)
				throw "Unparsable command line arguments";
			
			const jsFile = args[1];
			if (!jsFile.endsWith(".js"))
				throw "Second argument expected to be a file with the .js extension.";
			
			return Path.dirname(jsFile);
		}
		
		return "";
	})();
	
	/** Translates the specified path to be relative to the entry point script. */
	const translatePath = (inPath: string) => scriptDirectory ?
		Path.resolve(scriptDirectory, inPath) : 
		Path.resolve(inPath);
	
	/** Reads the argument with the specified name from the process arguments. */
	const readArgument = (name: keyof IBundleOptions, required = false) =>
	{
		if (runningAsModule)
		{
			if (!options || typeof options !== "object")
				throw `Options object must be passed to this function.`;
			
			return <string>options[name];
		}
		else
		{
			const processArgs: string[] = process.argv;
			const prefix = `--${name}=`;
			const fullArgumentText = processArgs.find(arg => arg.startsWith(prefix));
			
			if (fullArgumentText)
			{
				const outValue = fullArgumentText.slice(prefix.length).trim();
				if (outValue)
					return outValue;
				
				throw `Argument ${prefix} cannot be empty`;
			}
			else if (required)
			{
				throw `Missing required argument ${prefix}).`;
			}
		}
	}
	
	(async () =>
	{
		const inArgument = readArgument("in", true);
		const outArgument = readArgument("out", true);
		const nsArgument = readArgument("namespace");
		const modArgument = readArgument("module");
		const headerArgument = readArgument("header");
		const footerArgument = readArgument("footer");
		
		const outFiles: string[] = Array.isArray(outArgument) ?
			outArgument : [outArgument];
		
		const headerLines: string[] = Array.isArray(headerArgument) ? 
			headerArgument : [headerArgument];
		
		const footerLines: string[] = Array.isArray(footerArgument) ?
			footerArgument : [footerArgument];
		
		const homeDefinitionFile = await DefinitionFile.read(translatePath(inArgument));
		if (!homeDefinitionFile)
			throw "No definition file found at: " + inArgument;
		
		await homeDefinitionFile.resolve();
		
		const definitionLines = homeDefinitionFile.emit(nsArgument, modArgument);
		definitionLines.unshift(...headerLines);
		definitionLines.push(...footerLines);
		
		if (footerLines.length)
			definitionLines.push("");
		
		for (const outFile of outFiles)
			Fs.writeFile(
				translatePath(outFile), 
				definitionLines.join("\n"), 
				"utf8", 
				(error: Error) => error && console.error(error));
	
	})().catch(reason =>
	{
		console.error(reason);
	});
}

if (runningAsModule)
	typeof module === "object" && (module.exports = bundle);
else
	bundle();
