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
		this.defragmenter = new X.Defragmenter(this);
		this.indentChecker = new X.IndentChecker(this);
		this.typeChecker = new X.TypeChecker(this);
		this.faults = new X.FaultService(this);
	}
	
	/** */
	readonly hooks: X.HookTypesInstance;
	
	/** */
	readonly agents: X.Agents;
	
	/** */
	readonly documents: X.DocumentGraph;
	
	/** */
	readonly defragmenter: X.Defragmenter;
	
	/** */
	readonly indentChecker: X.IndentChecker;
	
	/** */
	readonly typeChecker: X.TypeChecker;
	
	/** */
	readonly faults: X.FaultService;
	
	/**
	 * 
	 */
	inspect(document: X.Document, line: number, offset: number)
	{
		return new X.ProgramInspectionSite(
			document,
			line,
			offset,
			this.defragmenter);
	}
}
