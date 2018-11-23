import * as X from "./X";
import * as Path from "path";
import * as Vm from "vm";


/**
 * A cache that stores all agents loaded by the compiler.
 */
export class Agents
{
	/**
	 * @internal
	 * Called by Program once, during it's initialization.
	 */
	constructor(program: X.Program, hookRouter: X.HookRouter)
	{
		this.program = program;
		this.hookRouter = hookRouter;
	}
	
	/** @internal */
	private readonly program: X.Program;
	
	/** @internal */
	private readonly hookRouter: X.HookRouter;
	
	/**
	 * Constructs an agent from the specified file, or from
	 * a cache if the specified file has already been read.
	 * @returns A reference to the added agent.
	 */
	async add(sourceUri: X.Uri | string)
	{
		const uri = sourceUri instanceof X.Uri ?
			sourceUri :
			X.Uri.parse(sourceUri);
		
		if (uri === null)
			return null;
		
		// Be sure the agent build function
		// is in the cache before we proceed.
		if (!this.buildFunctionCache.has(uri.toString()))
		{
			const fileContents = X.UriReader.tryRead(uri);
			if (typeof fileContents !== "string")
				return null;
			
			const vmOptions: Vm.RunningScriptOptions = {
				filename: uri.toString(),
				lineOffset: 0,
				columnOffset: 0,
				displayErrors: true,
				timeout: 5000
			};
			
			const functionHeader = "return (function(Hooks, Truth, Program) { 'use strict';";
			const functionFooter = "}).bind(Object.freeze({}))";
			
			const script = new Vm.Script(
				functionHeader + fileContents + functionFooter,
				vmOptions);
			
			const agentBuildFn = <AgentBuildFunction>script.runInThisContext(vmOptions);
			this.buildFunctionCache.set(uri.toString(), agentBuildFn);
		}
		
		if (!this.program)
			throw X.ExceptionMessage.invalidCall();
		
		const agent = new Agent(uri, this.hookRouter);
		
		const buildFunction = this.buildFunctionCache.get(sourceUri.toString());
		if (!buildFunction)
			throw X.ExceptionMessage.agentNotRead();
		
		buildFunction(agent.hooks, X, this.program);
		this.agentCacheObject.add(agent);
		return agent;
	}
	
	/**
	 * Removes the agent from the system having the specified source file path. 
	 * @returns A boolean indicating whether an agent was deleted.
	 */
	delete(sourceUri: X.Uri | string)
	{
		const uri = sourceUri instanceof X.Uri ?
			sourceUri :
			X.Uri.parse(sourceUri);
		
		if (uri === null)
			return false;
		
		this.buildFunctionCache.delete(uri.toString());
		
		for (const agent of this.agentCacheObject)
		{
			if (agent.sourceUri.equals(uri))
			{
				this.agentCacheObject.delete(agent);
				return true;
			}
		}
		
		return false;
	}
	
	/** Stores a map of agent build functions, indexed by their absolute URI. */
	private readonly buildFunctionCache = new Map<string, AgentBuildFunction>();
	
	/** Stores a set of all agents added to the system. */
	private readonly agentCacheObject = new Set<Agent>();
}


/** */
export class Agent
{
	/**
	 * @internal
	 * Internal constructor for use by AgentSet. Do not call directly.
	 */
	constructor(sourceUri: X.Uri, router: X.HookRouter)
	{
		this.sourceUri = sourceUri;
		this.hooks = router.createHookTypesInstance(this);
	}
	
	/** Stores an array of documents that reference this Agent. */
	readonly referencingDocuments: X.Document[] = [];
	
	/** Stores the absolute path to the JavaScript file that contains the agent source code. */
	readonly sourceUri: X.Uri;
	
	/** Store the built-in hooks, as well as the hooks specified in the document. */
	readonly hooks: X.HookTypesInstance;
}


/** Stores the function signature that wraps all agent functions. */
type AgentBuildFunction = (hooks: X.HookTypesInstance, truth: typeof X, program: X.Program) => void;
