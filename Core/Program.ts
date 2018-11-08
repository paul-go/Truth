import * as X from "./X";


/**
 * The top-level object that manages Truth documents.
 */
export class Program
{
	/** */
	constructor()
	{
		const hookRouter = new X.HookRouter();
		this.hooks = hookRouter.createHookTypesInstance();
		
		// The ordering of these instantations is relevant,
		// because it reflects the order in which each of
		// these services are going to process hooks.
		this.agents = new X.Agents(this, hookRouter);
		this.documents = new X.DocumentGraph(this);
		this.fragmenter = new X.Fragmenter(this);
		
		// These are independent services that only
		// need to be launched and run in the background.
		new X.IndentCheckService(this);
		new X.VerificationService(this);
		
		this.types = new X.TypeGraph(this);
		this.faults = new X.FaultService(this);
	}
	
	/** */
	readonly hooks: X.HookTypesInstance;
	
	/** */
	readonly agents: X.Agents;
	
	/** */
	readonly documents: X.DocumentGraph;
	
	/** @internal */
	readonly fragmenter: X.Fragmenter;
	
	/** */
	readonly types: X.TypeGraph;
	
	/** */
	readonly faults: X.FaultService;
	
	/**
	 * Begin inspecting the specified document,
	 * starting with the types defined at it's root.
	 */
	inspect(document: X.Document): X.ProgramInspectionSite;
	/**
	 *  
	 */
	inspect(document: X.Document, line: number, offset: number): X.ProgramInspectionSite;
	/**
	 * 
	 */
	inspect(document: X.Document, statement: X.Statement): X.ProgramInspectionSite;
	/**
	 * 
	 */
	inspect(document: X.Document, pointer: X.Pointer): X.ProgramInspectionSite;
	inspect(document: X.Document, lsp?: any, offset?: number)
	{
		const param: X.InspectionParam | null = 
			lsp instanceof X.Statement || lsp instanceof X.Pointer? lsp :
			typeof offset === "number" && offset === offset ? { line: lsp | 0, offset } :
			null;
		
		if (!param)
			throw X.ExceptionMessage.invalidArgument();
		
		return new X.ProgramInspectionSite(this, document, param);
	}
}
