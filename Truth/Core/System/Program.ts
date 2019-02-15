import * as X from "../X";


/**
 * The top-level object that manages Truth documents.
 */
export class Program
{
	/**
	 * Creates a new Program, into which Documents may
	 * be added, and verified.
	 */
	constructor()
	{
		const hookRouter = new X.HookRouter();
		this.hooks = hookRouter.createHookTypesInstance();
		this._version = X.VersionStamp.next();
		
		// The ordering of these instantations is relevant,
		// because it reflects the order in which each of
		// these services are going to process hooks.
		
		this.hooks.DocumentCreated.capture(hook =>
		{
			this.unverifiedDocuments.push(hook.document);
		});
		
		this.hooks.DocumentDeleted.capture(hook =>
		{
			const idx = this.unverifiedDocuments.indexOf(hook.document);
			if (idx > -1)
				this.unverifiedDocuments.splice(idx, 1);
		});
		
		this.agents = new X.Agents(this, hookRouter);
		this.documents = new X.DocumentGraph(this);
		this.graph = new X.HyperGraph(this);
		
		this.hooks.Revalidate.capture(hook =>
		{
			for (let i = this.unverifiedStatements.length; i-- > 0;)
				if (this.unverifiedStatements[i].isDisposed)
					this.unverifiedStatements.splice(i, 1);
			
			for (const statement of hook.parents)
				if (!statement.isCruft)
					this.unverifiedStatements.push(statement);
		});
		
		this.faults = new X.FaultService(this);
		
		this.hooks.EditComplete.capture(hook =>
		{
			this._version = X.VersionStamp.next();
		});
	}
	
	/** */
	readonly hooks: X.HookTypesInstance;
	
	/** */
	readonly agents: X.Agents;
	
	/** */
	readonly documents: X.DocumentGraph;
	
	/** @internal */
	readonly graph: X.HyperGraph;
	
	/**  */
	readonly faults: X.FaultService;
	
	/** */
	get version()
	{
		return this._version;
	}
	private _version: X.VersionStamp;
	
	/**
	 * @returns A fully constructed Type instance that corresponds to
	 * the type at the URI specified. In the case when no type could be
	 * found at the specified location, null is returned.
	 */
	query(uri: X.Uri | string)
	{
		const uriObject = X.Uri.maybeParse(uri);
		if (uriObject === null)
			throw X.Exception.invalidUri();
		
		return X.Type.construct(uriObject, this);
	}
	
	/**
	 * @returns A fully constructed Type instance that corresponds to
	 * the type path specified. In the case when no type could be found
	 * at the specified location, null is returned.
	 * 
	 * @param document An instance of a Document that specifies
	 * where to begin the query.
	 * 
	 * @param typePath The type path to query within the the specified
	 * Document. If omitted, an array that contains the root-level types
	 * defined in the specified Document is returned.
	 */
	queryDocument(document: X.Document, ...typePath: string[])
	{
		if (typePath.length === 0)
			return X.Type.constructRoots(document);
		
		const uri = document.sourceUri.extendType(typePath);
		return X.Type.construct(uri, this);
	}
	
	/**
	 * Begin inspecting a document loaded
	 * into this program, a specific location.
	 */
	inspect(
		document: X.Document,
		line: number,
		offset: number): ProgramInspectionResult
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
					.reduce((spines, s) => spines.concat(s), [])
					.map(spine => X.Type.construct(spine, this));
				
				return new ProgramInspectionResult(types, statement, null);
			}
			//
			case X.StatementRegion.pattern:
			{
				// TODO: This should not be returning a PatternLiteral,
				// but rather a fully constructed IPattern object. This
				// code is only here as a shim.
				const patternTypes: X.Type[] = [];
				return new ProgramInspectionResult(patternTypes, statement);
			}
			// Return all the types related to the specified declaration.
			case X.StatementRegion.declaration:
			{
				const decl = statement.getDeclaration(offset);
				if (!decl)
					throw X.Exception.unknownState();
				
				const types = decl
					.factor()
					.map(spine => X.Type.construct(spine, this));
				
				return new ProgramInspectionResult(types, statement, decl);
			}
			// 
			case X.StatementRegion.annotation:
			{
				const anno = statement.getAnnotation(offset);
				if (!anno)
					throw X.Exception.unknownState();
				
				const spine = statement.declarations[0].factor()[0];
				const type = X.Type.construct(spine, this);
				const annoText = anno.boundary.subject.toString();
				const base = type.bases.find(b => b.name === annoText);
				const bases = base ? [base] : [];
				
				return new ProgramInspectionResult(bases, statement, anno);
			}
		}
		
		return new ProgramInspectionResult(null, statement, null);
	}
	
	/**
	 * Performs a full verification of all documents loaded into the program.
	 * This Program's .faults field is populated with any faults generated as
	 * a result of the verification. If no documents loaded into this program
	 * has been edited since the last verification, verification is not re-attempted.
	 * 
	 * @returns An entrypoint into performing analysis of the Types that
	 * have been defined in this program.
	 */
	verify()
	{
		for (const doc of this.documents.each())
			for (const { statement } of doc.eachDescendant())
				this.verifyAssociatedDeclarations(statement);
		
		return this.finalizeVerification();
	}
	
	/**
	 * Performs verification on the parts of the document that have
	 * not been verified since the last call to this method. Once this
	 * method has completed, any detected faults will be available
	 * by using the methods located in the `.faults` property of this
	 * instance.
	 * 
	 * @returns A boolean value that indicates whether verification
	 * completed without detecting any faults in this Program.
	 */
	reverify()
	{
		for (const doc of this.unverifiedDocuments)
			for (const { statement } of doc.eachDescendant())
				this.verifyAssociatedDeclarations(statement);
		
		for (const smt of this.unverifiedStatements)
			this.verifyAssociatedDeclarations(smt);
		
		return this.finalizeVerification();
	}
	
	/** */
	private verifyAssociatedDeclarations(statement: X.Statement)
	{
		if (!statement.isDisposed)
			for (const decl of statement.declarations)
				decl.factor().map(spine => 
					X.Type.construct(spine, this));
	}
	
	/** */
	private finalizeVerification()
	{
		this.faults.refresh();
		this.unverifiedDocuments.length = 0;
		this.unverifiedStatements.length = 0;
		return this.faults.count === 0;
	}
	
	/** */
	private readonly unverifiedStatements: X.Statement[] = [];
	
	/** */
	private readonly unverifiedDocuments: X.Document[] = [];
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
		 * what was found at the specified location. Stores null in the
		 * case when the specified location contains an object that
		 * has been marked as cruft (the statement and span fields
		 * are still populated in this case).
		 */
		readonly foundObject: X.Document | X.Type[] | null,
		
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
