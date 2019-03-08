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
		this._version = X.VersionStamp.next();
		
		// The ordering of these instantations is relevant,
		// because it reflects the order in which each of
		// these services are going to process hooks.
		
		this.on(X.CauseDocumentCreate, data =>
		{
			this.unverifiedDocuments.push(data.document);
		});
		
		this.on(X.CauseDocumentDelete, data =>
		{
			const idx = this.unverifiedDocuments.indexOf(data.document);
			if (idx > -1)
				this.unverifiedDocuments.splice(idx, 1);
		});
		
		this.on(X.CauseDocumentUriChange, () =>
		{
			this._version = X.VersionStamp.next();
		});
		
		this.on(X.CauseAgentDetach, data =>
		{
			for (const [cause, attachments] of this.causes)
				for (const attachment of attachments)
					if (attachment.uri && attachment.uri.equals(data.uri))
						this.causes.delete(cause, attachment);
		});
		
		this.agentCache = new X.AgentCache(this);
		this.documents = new X.DocumentGraph(this);
		this.graph = new X.HyperGraph(this);
		
		this.on(X.CauseRevalidate, data =>
		{
			for (let i = this.unverifiedStatements.length; i-- > 0;)
				if (this.unverifiedStatements[i].isDisposed)
					this.unverifiedStatements.splice(i, 1);
			
			for (const statement of data.parents)
				if (!statement.isCruft)
					this.unverifiedStatements.push(statement);
		});
		
		this.faults = new X.FaultService(this);
		
		this.on(X.CauseEditComplete, () =>
		{
			this._version = X.VersionStamp.next();
		});
	}
	
	/** @internal */
	private readonly agentCache: X.AgentCache;
	
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
	 * Probes the program and returns an array containing information
	 * about the callbacks that will be triggered if a cause of the specified
	 * type is broadcasted. Essentially, this method answers the question, 
	 * "Who is listening for Causes of type X?".
	 * 
	 * If no agents have attached to the specified type, an empty array
	 * is returned.
	 */
	probe(causeType: new (...args: any[]) => any, scope: AttachmentScope = this)
	{
		if (scope instanceof X.Type)
			throw X.Exception.notImplemented();
		
		const results: { uri: X.Uri | null; scope: AttachmentScope }[] = [];
		const push = (ca: CauseAttachment) =>
			results.push({ uri: ca.uri, scope: ca.scope });
		
		for (const [causeTypeKey, attachments] of this.causes)
			if (causeType === causeTypeKey)
				for (const ca of attachments)
					if (scope === ca.scope || 
						scope instanceof X.Program && ca.scope instanceof X.Document)
						push(ca);
		
		return results;
	}
	
	/**
	 * 
	 */
	on<T extends X.Cause<any>>(
		causeType: new (...args: any[]) => T,
		fn: (data: X.TCauseData<T>) => X.TCauseReturn<T>,
		scope?: X.Document | X.Type): void
	{
		const info = getHolderInfo(this);
		const usingScope: AttachmentScope = scope || info.scope || this;
		const ca = new CauseAttachment(info.uri, fn, usingScope);
		this.causes.add(causeType, ca);
	}
	
	/**
	 * Progates the specified Cause object to all subscribers that
	 * are listening for causes of object's type. 
	 * 
	 * @param cause A reference to the Cause instance to broadcast.
	 * 
	 * @param filter An optional array of Uri instances that
	 * specify the origin from where an agent that is attached
	 * to the cause must loaded in order to be delivered the
	 * cause instance.
	 * 
	 * @returns An object that stores information about the
	 * cause results that were returned, and the URI of the 
	 * agent that produced the result. In the case when the
	 * agent was attached programmatically, the URI value 
	 * will be null.
	 */
	cause<R>(cause: X.Cause<R>, ...filters: X.Uri[])
	{
		const causeType = <typeof X.Cause>cause.constructor;
		const attachmentsAll = this.causes.get(causeType) || [];
		const attachments = attachmentsAll.filter(attachment =>
		{
			if (filters.length === 0)
				return true;
			
			const otherUri = attachment.uri;
			if (otherUri === null)
				return true;
			
			return filters.find(uri => uri.equals(otherUri));
		});
		
		if (attachments.length === 0)
			return [];
		
		const result: { from: X.Uri | null; returned: R }[] = [];
		
		for (const attachment of attachments)
		{
			const returned: R = attachment.callback(cause);
			if (returned !== null && returned !== undefined)
				result.push({ from: attachment.uri, returned });
		}
		
		return result;
	}
	
	/** @internal */
	private readonly causes = new X.MultiMap<typeof X.Cause, CauseAttachment>();
	
	/**
	 * Augments the global scope of the agents attached to this
	 * program with a variable whose name and value are specified
	 * in the arguments to this method. (Note that this only affects
	 * agents that are attached *after* this call has been made.)
	 */
	augment(name: string, value: object)
	{
		this.agentCache.augment(name, value);
	}
	
	/**
	 * 
	 */
	attach(agentUri: X.Uri): Promise<Error | void>
	{
		return new Promise(() =>
		{
			throw X.Exception.notImplemented();
		});
	}
	
	/**
	 * 
	 */
	detach(agentUri: X.Uri)
	{
		throw X.Exception.notImplemented();
	}
	
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
				const bases = base ? [base] : null;
				
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
	
	/**
	 * @internal
	 * Stores information about the agent that holds the reference
	 * to this Program instance. The property is undefined in the
	 * case when the instance is not held by an agent.
	 * 
	 * This value is applied through the Misc.patch() function, which
	 * uses a Proxy object to provide 
	 */
	readonly instanceHolder?: {
		uri: X.Uri;
		scope: AttachmentScope;
	}
}


/**
 * Gets a stringified version of the Uri that holds this Program instance.
 */
function getHolderInfo(program: Program)
{
	const ih = program.instanceHolder;
	
	return {
		uri: <X.Uri | null>(ih ? ih.uri : null),
		scope: <AttachmentScope>(ih ? ih.scope : program)
	};
}


/**
 * @internal
 * Stores information about the attachment
 * of a cause callback function.
 */
class CauseAttachment
{
	/** */
	constructor(
		readonly uri: X.Uri | null,
		readonly callback: (data: any) => any,
		readonly scope: AttachmentScope)
	{ }
}


/**
 * Describes a place in the program where a cause is attached.
 */
export type AttachmentScope = X.Program | X.Document | X.Type;


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
	{
		if (Array.isArray(foundObject) && foundObject.length === 0)
			this.foundObject = null;
	}
}
