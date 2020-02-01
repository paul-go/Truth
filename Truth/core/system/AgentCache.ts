
namespace Truth
{
	/**
	 * @internal
	 * A cache that stores agent build function loaded by a single program instance.
	 */
	export class AgentCache
	{
		/** */
		constructor(private readonly program: Program)
		{
			/*
			program.on(CauseUriReferenceAdd, data =>
			{
				if (data.uri.ext === UriExtension.js)
					this.attachAgent(data.uri, data.statement);
			});
			
			program.on(CauseUriReferenceRemove, data =>
			{
				if (data.uri.ext === UriExtension.js)
					this.detachAgent(data.uri, data.statement);
			});
			*/
		}
		
		/** * /
		private async attachAgent(uri: KnownUri, statement: Statement | null)
		{
			const existingCacheSet = this.cache.get(uri);
			const reference = statement || this.program;
			
			if (existingCacheSet)
			{
				existingCacheSet.add(reference);
				return;
			}
			
			const scope = statement instanceof Statement ?
				statement.document :
				this.program;
			
			const sourceRaw = await UriReader.tryRead(uri);
			if (sourceRaw instanceof Error)
				return sourceRaw;
			
			const source = this.maybeAdjustSourceMap(uri, sourceRaw);
			const patchedProgram = Misc.patch(this.program, {
				instanceHolder: { uri, scope }
			});
			
			const params = [
				"program",
				"Truth",
				"require",
				...this.agentFunctionParameters.keys(),
				source
			];
			
			const args = [
				patchedProgram,
				Truth,
				AgentCache.hijackedRequireFn,
				...this.agentFunctionParameters.values()
			];
			
			try
			{
				const fn = Object.freeze(Function.apply(Function, params));
				await fn.apply(fn, args as any);
			}
			catch (e)
			{
				this.reportUserLandError(e);
				return;
			}
			
			this.program.cause(new CauseAgentAttach(uri, scope));
			const set = new Set<Statement | Program>([reference]);
			this.cache.set(uri, set);
		}
		
		/** * /
		private detachAgent(uri: KnownUri, statement: Statement | null)
		{
			const existingCacheSet = this.cache.get(uri);
			if (!existingCacheSet)
				return;
			
			existingCacheSet.delete(statement || this.program);
			if (existingCacheSet.size === 0)
			{
				this.cache.delete(uri);
				this.program.cause(new CauseAgentDetach(uri));
			}
		}
		
		/**
		 * @internal
		 * (Called by Program)
		 */
		augment(name: string, value: object)
		{
			if (this.agentFunctionParameters.has(name))
				throw Exception.causeParameterNameInUse(name);
			
			this.agentFunctionParameters.set(
				name,
				value);
		}
		
		/** */
		private readonly agentFunctionParameters = new Map<string, any>();
		
		/**
		 * Adjusts the content of the sourcemap in the specified source code 
		 * file, to account for the discrepencies introduced by wrapping JavaScript
		 * source code in a new Function() constructor.
		 */
		private maybeAdjustSourceMap(sourceUri: KnownUri, sourceCode: string)
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
			
			const sourceMapUrl = ["//", "#", " source", "MappingURL="].join("");
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
			const sourceMap: ISourceMap = Misc.tryParseJson(sourceMapRaw);
			if (!sourceMap)
				return sourceCode;
			
			// Unsupported source map version
			if (typeof sourceMap.mappings !== "string")
				return sourceCode;
			
			// Placing a ; in the "mappings" property of the source map object
			// shifts the lines down by 1. It needs to be + 1, because we wrap
			// the code in our own setTimeout() block.
			const prefix = ";".repeat(this.sourceMapLineOffset + 1);
			
			const pathModule = require("path") as typeof import("path");
			
			// Should actually be .toString() without a file.
			debugger;
			const basePath = sourceUri.toString();
			sourceMap.mappings = prefix + sourceMap.mappings;
			
			if (sourceMap.sources instanceof Array)
				sourceMap.sources = sourceMap.sources.map(s => 
					pathModule.join(basePath, s));
			
			const newSourceMap = this.toBase64(JSON.stringify(sourceMap));
			const newSourceCode = sourceCode.slice(0, lastLineStart);
			
			// The source code is wrapped in a setTimeout in order
			// to give any attached debuggers a chance to connect.
			const varName = "$$__RESOLVE_FUNCTION__$$";
			
			const newSourceCodeDelayed = 
				`return new Promise(${varName} => setTimeout(() => {\n` + 
				newSourceCode + 
				`; ${varName}(); }, 1))\n`;
			
			const newPrefix = sourceCode.slice(lastLineStart, endPos);
			return newSourceCodeDelayed + newPrefix + newSourceMap;
		}
		
		/** */
		private reportUserLandError(e: Error)
		{
			// NOTE: This should probably be reporting the error
			// somewhere where it's visible.
			debugger;
			throw e;
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
		private static readonly hijackedRequireFn = Object.freeze((specifier: string) =>
		{
			throw new Error(
				"The require() function is not available in this context. " +
				"Multi-file agents should be bundled with a bundler " + 
				"such as RollupJS.");
		});
		
		/**
		 * Stores the number of lines that are introduced by the script
		 * engine when a code block is wrapped in a new Function()
		 * block, which is then toString()'d. This is used in order to calculate
		 * source map line offsets (which varies by engine).
		 */
		private readonly sourceMapLineOffset = (() =>
		{
			// eslint-disable-next-line no-new-func
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
		private readonly cache = new Map<KnownUri, Set<Statement | Program>>();
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
		sourcesContent?: string[];
	}
}
