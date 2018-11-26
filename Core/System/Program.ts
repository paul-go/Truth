import * as X from "./X";


/**
 * The top-level object that manages Truth documents.
 */
export class Program
{
	/**
	 * Creates a new Program, into which Documents may
	 * be added, and verified.
	 * 
	 * @param autoVerify Indicates whether verification should
	 * occur after every edit cycle, and reports faults to this 
	 * Program's .faults field.
	 */
	constructor(autoVerify = true)
	{
		const hookRouter = new X.HookRouter();
		this.hooks = hookRouter.createHookTypesInstance();
		
		this.hooks.Invalidate.capture(() =>
		{
			this.lastProgramAnalyzer = null;
		});
		
		// The ordering of these instantations is relevant,
		// because it reflects the order in which each of
		// these services are going to process hooks.
		this.agents = new X.Agents(this, hookRouter);
		this.documents = new X.DocumentGraph(this);
		this.fragmenter = new X.Fragmenter(this);
		this.indentCheckService = new X.IndentCheckService(this, autoVerify);
		
		if (autoVerify)
			new X.VerificationService(this);
		
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
	
	/**  */
	readonly faults: X.FaultService;
	
	/** */
	private readonly indentCheckService: X.IndentCheckService;
	
	/**
	 * Stores an object that allows type analysis to be performed on
	 * this Program. It is reset at the beginning of every edit cycle.
	 */
	private lastProgramAnalyzer: X.ProgramAnalyzer | null = null;
	
	/**
	 * Performs a full verification of all documents loaded into the program.
	 * This Program's .faults field is populated with any faults generated as
	 * a result of the verification. If no documents loaded into this program
	 * has been edited since the last verification, verification is not re-attempted.
	 * 
	 * @returns An entrypoint into performing analysis of the Types that
	 * have been defined in this program.
	 */
	analyze()
	{
		if (this.lastProgramAnalyzer)
			return this.lastProgramAnalyzer;
		
		for (const doc of this.documents.each())
			this.indentCheckService.invoke(doc);
		
		return new X.ProgramAnalyzer(this);
	}
	
	/**
	 * Begin inspecting a document loaded
	 * into this program, a specific location.
	 */
	inspect(document: X.Document, line: number, offset: number): ProgramInspectionResult
	{
		const statement = document.read(line);
		const region = statement.getRegion(offset);
		
		switch (region)
		{
			case X.StatementRegion.void:
				return new ProgramInspectionResult(null, statement);
			
			// Return all the types in the declaration side of the parent.
			case X.StatementRegion.whitespace:
			{
				const parent = document.getParentFromPosition(line, offset);
				if (parent instanceof X.Document)
					return new ProgramInspectionResult(parent, statement);
				
				const types = parent.declarations
					.map(decl => decl.factor())
					.reduce((spines, s) => spines.concat(s))
					.map(spine => X.Type.get(spine));
				
				return new ProgramInspectionResult(types, statement, null);
			}
			//
			case X.StatementRegion.pattern:
			{
				// TODO: This should not be returning a PatternLiteral,
				// but rather a fully constructed IPattern object. This
				// code is only here as a shim.
				const literal = statement.patternLiteral;
				return new ProgramInspectionResult(literal, statement);
			}
			// Return all the types related to the specified declaration.
			case X.StatementRegion.declaration:
			{
				const declPtr = statement.getDeclaration(offset);
				if (!declPtr)
					throw X.ExceptionMessage.unknownState();
				
				const types = declPtr.factor().map(spine => X.Type.get(spine));
				return new ProgramInspectionResult(types, statement, declPtr);
			}
			// 
			case X.StatementRegion.annotation:
			{
				const annoPtr = statement.getAnnotation(offset);
				if (!annoPtr)
					throw X.ExceptionMessage.unknownState();
				
				// This will be implemented after type construction.
				throw X.ExceptionMessage.notImplemented();
			}
		}
		
		return new ProgramInspectionResult(null, statement, null);
	}
}


/**
 * Stores the details about a precise location in a Document.
 */
export class ProgramInspectionResult
{
	/** @internal */
	constructor(
		/**
		 * Stores the compilation object that most closely represents
		 * what was found at the specified location.
		 */
		readonly result: X.Document | X.Type[] | X.PatternLiteral | X.Alias | null,
		
		/**
		 * Stores the Statement found at the specified location.
		 */
		readonly statement: X.Statement,
		
		/**
		 * Stores the Span found at the specified location, or
		 * null in the case when no Span was found, such as if
		 * the specified location is whitespace or a comment.
		 */
		readonly span: X.Span | null = null)
	{ }
}
