import * as X from "../X";


/**
 * @internal
 * A cache that stores agent build function loaded by a single program instance.
 */
export class AgentCache
{
	/** */
	constructor(program: X.Program)
	{
		this.program = program;
		
		program.on(X.CauseUriReferenceAdd, data =>
		{
			if (data.uri.ext !== X.UriExtension.js)
				return;
			
			const uriText = data.uri.toStoreString();
			const existingCacheSet = this.cache.get(uriText);
			const reference = data.statement || this.program;
			
			if (existingCacheSet)
			{
				existingCacheSet.add(reference);
				return;
			}
			
			this.exec(data.uri).then(result =>
			{
				if (result instanceof Error)
				{
					"Need to deal with reporting agent load errors as faults here.";
					debugger;
					return;
				}
				
				this.program.cause(new X.CauseAgentAttach(data.uri));
				result();
				
				const set = new Set<X.Statement | X.Program>([reference]);
				this.cache.set(uriText, set);
			});
		});
		
		program.on(X.CauseUriReferenceRemove, data =>
		{
			if (data.uri.ext !== X.UriExtension.js)
				return;
			
			const uriText = data.uri.toStoreString();
			const existingCacheSet = this.cache.get(uriText);
			if (!existingCacheSet)
				return;
			
			existingCacheSet.delete(data.statement || this.program);
			if (existingCacheSet.size === 0)
			{
				this.cache.delete(uriText);
				this.program.cause(new X.CauseAgentDetach(data.uri));
			}
		});
	}
	
	/** */
	private readonly program: X.Program;
	
	/**
	 * Execute the code file containing the agent at the specified URI.
	 */
	private async exec(agentUri: X.Uri): Promise<(() => any) | Error>
	{
		const uri = X.Uri.maybeParse(agentUri);
		if (uri === null)
			return X.Exception.invalidUri();
		
		const uriText = uri.toStoreString();
		
		const sourceRaw = await X.UriReader.tryRead(uri);
		if (sourceRaw instanceof Error)
			return sourceRaw;
		
		const source = this.maybeAdjustSourceMap(
			agentUri,
			sourceRaw);
		
		try
		{
			const patchedProgram = X.Misc.patch(this.program,
			{
				instanceOwnerUri: uri
			});
			
			// For the time being, these are the only 3 parameters that
			// are fed to agent functions. In the future, it may be possible
			// To declare your own agent globals that are fed to all agents.
			const ctor = new Function("program", "Truth", "require", source);
			return ctor.bind(
				Object.freeze({}),
				patchedProgram,
				X,
				AgentCache.hijackedRequireFn);
		}
		catch (e)
		{
			return new Error(e.message || "");
		}
	}
	
	/**
	 * Adjusts the content of the sourcemap in the specified source code 
	 * file, to account for the discrepencies introduced by wrapping JavaScript
	 * source code in a new Function() constructor.
	 */
	private maybeAdjustSourceMap(sourceUri: X.Uri, sourceCode: string)
	{
		// We can't do any of this source map mutation without Node.JS
		// access right now. Maybe this will change in the future.
		if (typeof require !== "function")
			return sourceCode;
		
		const lastLineStart = (() =>
		{
			for (let i = sourceCode.length; i-- > 1;)
				if (sourceCode[i - 1] === "\n")
					return i;
			
			return -1;
		})();
		
		if (lastLineStart < 0)
			return sourceCode;
		
		const sourceMapUrl = "//# sourceMappingURL=";
		if (sourceCode.substr(lastLineStart, sourceMapUrl.length) !== sourceMapUrl)
			return sourceCode;
		
		const startPos = lastLineStart + sourceMapUrl.length;
		const ending = ";base64,";
		const endPos = sourceCode.indexOf(ending, startPos) + ending.length;
		
		// Unsupported source map format.
		if (endPos < ending.length)
			return sourceCode;
		
		const sourceMapRaw = this.fromBase64(sourceCode.slice(endPos));
		
		// There's probably some error in the source map
		if (!sourceMapRaw)
			return sourceCode;
		
		// The source map isn't parsing as a JSON object ... probably broken somehow
		const sourceMap: ISourceMap = X.Misc.tryParseJson(sourceMapRaw);
		if (!sourceMap)
			return sourceCode;
		
		// Unsupported source map version
		if (typeof sourceMap.mappings !== "string")
			return sourceCode;
		
		// Placing a ; in the "mappings" property of the source map object
		// shifts the lines down by 1. It needs to be + 1, because we wrap
		// the code in our own setTimeout() block.
		const prefix = ";".repeat(this.sourceMapLineOffset + 1);
		
		const pathModule = <typeof import("path")>require("path");
		const basePath = sourceUri.toStoreString(true);
		sourceMap.mappings = prefix + sourceMap.mappings;
		
		if (sourceMap.sources instanceof Array)
			sourceMap.sources = sourceMap.sources.map(s => 
				pathModule.join(basePath, s));
		
		const newSourceMap = this.toBase64(JSON.stringify(sourceMap));
		const newSourceCode = sourceCode.slice(0, lastLineStart);
		
		// The source code is wrapped in a setTimeout in order
		// to give any attached debuggers a chance to connect.
		const newSourceCodeDelayed = "setTimeout(() => {\n" + newSourceCode + "}, 1)\n";
		const newPrefix = sourceCode.slice(lastLineStart, endPos);
		
		return newSourceCodeDelayed + newPrefix + newSourceMap;
	}
	
	/** */
	private toBase64(plain: string)
	{
		return typeof btoa === "function" ?
			btoa(plain) :
			Buffer.from(plain, "ascii").toString("base64");
	}
	
	/** */
	private fromBase64(encoded: string)
	{
		return typeof atob === "function" ?
			atob(encoded) :
			Buffer.from(encoded, "base64").toString("ascii");
	}
	
	/**
	 * The require() function is not available within the context of an
	 * agent for numerous (and non-obvious) reasons. This function
	 * is fed into all agent functions to prevent any otherwise available
	 * require() function from being accessed.
	 */
	private static readonly hijackedRequireFn = Object.freeze(((specifier: string) =>
	{
		throw new Error(
			"The require() function is not available in this context. " +
			"Multi-file agents should be bundled with a bundler " + 
			"such as RollupJS.");
		
	}).bind(null));
	
	/**
	 * Stores the number of lines that are introduced by the script
	 * engine when a code block is wrapped in a new Function()
	 * block, which is then toString()'d. This is used in order to calculate
	 * source map line offsets (which varies by engine).
	 */
	private readonly sourceMapLineOffset = (() =>
	{
		const testFn = new Function("a", "b", "c", ";");
		const lineCount = testFn.toString().split("\n").length;
		return lineCount - 2;
	})();
	
	/**
	 * Stores a map whose keys are agent URIs, and whose values
	 * are a set of Statement instances that reference the agent,
	 * or, in the case when the agent is added to the program
	 * through another means (such as programmatically),
	 * a reference to the program is stored instead.
	 * 
	 * Technically an agent should be attached in only one place
	 * in the program, however, this may not always be the case,
	 * and the system needs to be able to handle the case when
	 * it isn't.
	 * 
	 * This array is used to reference count / garbage collect
	 * the attached agents.
	 */
	private readonly cache = new Map<string, Set<X.Statement | X.Program>>();
}

declare function atob(input: string): string;
declare function btoa(input: string): string;


/**
 * A simple type definition for a V3 source map object.
 */
interface ISourceMap
{
	version: 3;
	file?: string;
	sourceRoot?: string;
	sources?: string[];
	names?: string[];
	mappings: string;
	sourcesContent?: string[]
}
