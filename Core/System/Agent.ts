import * as X from "../X";


/**
 * Stores the function signature that wraps all agent functions.
 */
export type AgentFn = (
	hooks: X.HookTypesInstance,
	truth: typeof X,
	program: X.Program) => void;


const cache = Object.freeze({
	
	/**
	 * Stores a set of all agents added to the system.
	 */
	agentObjects: new Set<Agent>(),
	
	/**
	 * Stores a map of agent build functions, indexed by their absolute URI.
	 */
	agentFns: new Map<string, X.AgentFn>(),
	
	/**
	 * Stores a multi map of agents, and the documents that reference them.
	 */
	agentToDocuments: new X.MultiMap<Agent, X.Document>(),
	
	/**
	 * Stores a multi map of each document, and the agents they reference.
	 */
	documentToAgents: new X.MultiMap<X.Document, Agent>()
});


/**
 * A cache that stores all agents loaded by the compiler.
 */
export class Agents
{
	/**
	 * @internal
	 * Called by Program once, during it's initialization.
	 */
	constructor(program: X.Program, router: X.HookRouter)
	{
		this.program = program;
		this.router = router;
		
		program.hooks.UriReferenceAdded.capture(hook =>
		{
			if (hook.uri.ext !== X.UriExtension.js)
				return;
			
			this.add(hook.uri);
		});
		
		program.hooks.UriReferenceRemoved.capture(hook =>
		{
			if (hook.uri.ext !== X.UriExtension.js)
				return;
			
			this.remove(hook.uri);
		});
	}
	
	/** */
	private readonly program: X.Program;
	
	/** */
	private readonly router: X.HookRouter;
	
	/**
	 * Constructs an agent from the specified file, or from
	 * a cache if the specified file has already been read.
	 * @returns A reference to the added agent.
	 */
	async add(sourceUri: X.Uri | string)
	{
		const uri = X.Uri.maybeParse(sourceUri);
		if (uri === null)
			return null;
		
		const uriText = uri.toStoreString();
		let agentFn: AgentFn;
		
		if (!cache.agentFns.has(uriText))
		{
			const agentSource = await X.UriReader.tryRead(uri);
			if (agentSource instanceof Error)
				return agentSource;
			
			try
			{
				agentFn = <AgentFn>new Function("program", "editor", agentSource);
				cache.agentFns.set(uriText, agentFn);
			}
			catch (e)
			{
				return null;
			}
		}
		
		const agent = new Agent(uri, this.router);
		
		const constructFn = cache.agentFns.get(uriText);
		if (!constructFn)
			return X.Exception.agentNotRead();
		
		constructFn(agent.hooks, X, this.program);
		cache.agentObjects.add(agent);
		return agent;
	}
	
	/**
	 * Removes the agent from the system having the specified source file path. 
	 * @returns A boolean indicating whether an agent was deleted.
	 */
	remove(sourceUri: X.Uri | string)
	{
		const uri = X.Uri.maybeParse(sourceUri);
		if (uri === null)
			return false;
		
		cache.agentFns.delete(uri.toString());
		
		for (const agent of cache.agentObjects)
		{
			if (agent.sourceUri.equals(uri))
			{
				cache.agentObjects.delete(agent);
				return true;
			}
		}
		
		return false;
	}
}


/**
 * @internal
 */
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
	
	/**
	 * Stores the absolute path to the JavaScript file that contains
	 * the agent source code.
	 */
	readonly sourceUri: X.Uri;
	
	/**
	 * Store the built-in hooks, as well as the hooks specified in
	 * the document.
	 */
	readonly hooks: X.HookTypesInstance;
}
