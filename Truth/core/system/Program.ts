
namespace Truth
{
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
			this._version = VersionStamp.next();
			this.reader = Truth.createDefaultUriReader();
			
			// The ordering of these instantations is relevant,
			// because it reflects the order in which each of
			// these services are going to process hooks.
			
			this.on(CauseDocumentCreate, data =>
			{
				this.unverifiedDocuments.push(data.document);
			});
			
			this.on(CauseDocumentDelete, data =>
			{
				const idx = this.unverifiedDocuments.indexOf(data.document);
				if (idx > -1)
					this.unverifiedDocuments.splice(idx, 1);
			});
			
			this.on(CauseDocumentUriChange, () =>
			{
				this._version = VersionStamp.next();
			});
			
			this.on(CauseAgentDetach, data =>
			{
				for (const [cause, attachments] of this.causes)
					for (const attachment of attachments)
						if (attachment.uri && attachment.uri === data.uri)
							this.causes.delete(cause, attachment);
			});
			
			this.agentCache = new AgentCache(this);
			this.graph = new HyperGraph(this);
			this.cycleDetector = new CycleDetector(this);
			
			this.on(CauseRevalidate, data =>
			{
				for (let i = this.unverifiedStatements.length; i-- > 0;)
					if (this.unverifiedStatements[i].isDisposed)
						this.unverifiedStatements.splice(i, 1);
				
				for (const statement of data.parents)
					if (!statement.isCruft)
						this.unverifiedStatements.push(statement);
			});
			
			this.faults = new FaultService(this);
			
			this.on(CauseEditComplete, () =>
			{
				this._version = VersionStamp.next();
			});
		}
		
		/**
		 * Override the default UriReader used by the program.
		 * This reader is used to load the contents of files that 
		 * are referenced within uri-containing statements within
		 * Truth documents.
		 */
		setReader(reader: IUriReader)
		{
			this.reader = reader;
		}
		private reader: IUriReader;
		
		/**
		 * Adds a document to this program with the specified sourceText.
		 * The URI for the document is an auto-generated, auto-incrementing
		 * number.
		 * 
		 * For example, the first document added in this way is considered
		 * to have the URI "memory://memory/1.truth", the second being 
		 * "memory://memory/2.truth", and so on.
		 */
		async addDocument(sourceText: string)
		{
			const memoryUri = KnownUri.createMemoryUri(++this.memoryUriCount);
			return await Document.new(this, memoryUri, sourceText, d => this.saveDocument(d));
		}
		private memoryUriCount = 0;
		
		/**
		 * Adds a document to this program, by loading it from the specified
		 * URI. In the case when there has already been a document loaded
		 * from the URI specified, this pre-loaded document is returned.
		 * 
		 * @param documentUri The URI that will represent the source 
		 * location of the loaded document.
		 * 
		 * @param sourceText The source text to load into the document
		 * by default. If omitted, the source text will be loaded from the
		 * the URI specified in the `documentUri`  argument.
		 * 
		 * Use this argument when the source text of the document being
		 * added has already been loaded into a string by another means,
		 * or when more control of the actual loaded content is required.
		 */
		async addDocumentFromUri(
			documentUri: string | KnownUri,
			sourceText?: string)
		{
			const uri = typeof documentUri === "string" ?
				KnownUri.fromString(documentUri) :
				documentUri;
			
			if (!uri)
				throw Exception.invalidUri();
			
			const existingDoc = this.getDocumentByUri(uri);
			if (existingDoc)
				return existingDoc;
			
			const promises = this.queue.get(uri);
			if (promises)
			{
				return new Promise<Document | Error>(resolve =>
				{
					promises.push(resolve as any);
				});
			}
			
			// The problem with this design is that I don't know if the 
			// resolve function is going to be called synchronously.
			// If it is, this code structure will probably work.
			
			return new Promise<Document | Error>(async resolve =>
			{
				this.queue.set(uri, [resolve]);
				
				if (sourceText === undefined)
				{
					const loadedSourceText = await (async () =>
					{
						const readResult = await this.reader.tryRead(uri);
						if (readResult instanceof Error)
							return readResult;
						
						return readResult;
					})();
				
					if (loadedSourceText instanceof Error)
						return loadedSourceText;
					
					sourceText = loadedSourceText;
				}
				
				const docOrError = await Document.new(
					this,
					uri,
					sourceText,
					d => this.saveDocument(d));
				
				const resolveFns = this.queue.get(uri);
				if (resolveFns)
				{
					this.queue.delete(uri);
					for (const resolveFn of resolveFns)
						resolveFn(docOrError);
				}
			});
		}
		
		/** */
		private readonly queue = new Map<KnownUri, ((resolved: Document | Error) => void)[]>();
		
		/**
		 * Adds the specified document to the internal list of documents.
		 */
		private saveDocument(doc: Document)
		{
			this._documents.push(doc);
		}
		
		/**
		 * @returns The loaded document with the specified URI.
		 */
		getDocumentByUri(uri: KnownUri)
		{
			for (const doc of this._documents)
				if (doc.uri === uri)
					return doc;
			
			return null;
		}
		
		/**
		 * Gets a readonly array of truth documents
		 * that have been loaded into this Program.
		 */
		get documents(): readonly Document[]
		{
			return this._documents;
		}
		private readonly _documents: Document[] = [];
		
		/** @internal */
		readonly graph: HyperGraph;
		
		/** @internal */
		readonly cycleDetector: CycleDetector;
		
		/** @internal */
		private readonly agentCache: AgentCache;
		
		/**  */
		readonly faults: FaultService;
		
		/** */
		get version()
		{
			return this._version;
		}
		private _version: VersionStamp;
		
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
			if (scope instanceof Type)
				throw Exception.notImplemented();
			
			const results: { uri: KnownUri | null; scope: AttachmentScope; }[] = [];
			const push = (ca: CauseAttachment) =>
				results.push({ uri: ca.uri, scope: ca.scope });
			
			for (const [causeTypeKey, attachments] of this.causes)
				if (causeType === causeTypeKey)
					for (const ca of attachments)
						if (scope === ca.scope || 
							scope instanceof Program && ca.scope instanceof Document)
							push(ca);
			
			return results;
		}
		
		/**
		 * 
		 */
		on<T extends Cause<any>>(
			causeType: new (...args: any[]) => T,
			fn: (data: TCauseData<T>) => TCauseReturn<T>,
			scope?: Document | Type): void
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
		cause<R>(cause: Cause<R>, ...filters: KnownUri[])
		{
			const causeType = cause.constructor as typeof Cause;
			const attachmentsAll = this.causes.get(causeType) || [];
			const attachments = attachmentsAll.filter(attachment =>
			{
				if (filters.length === 0)
					return true;
				
				const otherUri = attachment.uri;
				if (otherUri === null)
					return true;
				
				return filters.find(uri => uri === otherUri);
			});
			
			if (attachments.length === 0)
				return [];
			
			const result: { from: KnownUri | null; returned: R }[] = [];
			
			for (const attachment of attachments)
			{
				const returned: R = attachment.callback(cause);
				if (returned !== null && returned !== undefined)
					result.push({ from: attachment.uri, returned });
			}
			
			return result;
		}
		
		/** @internal */
		private readonly causes = new MultiMap<typeof Cause, CauseAttachment>();
		
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
		attach(agentUri: KnownUri): Promise<Error | void>
		{
			return new Promise(() =>
			{
				throw Exception.notImplemented();
			});
		}
		
		/**
		 * 
		 */
		detach(agentUri: KnownUri)
		{
			throw Exception.notImplemented();
		}
		
		/**
		 * Queries the program for the root-level types that exist within
		 * the specified document.
		 * 
		 * @param document The document to query.
		 * 
		 * @returns An array containing the top-level types that are
		 * defined within the specified document.
		 */
		query(document: Document): readonly Type[];
		/**
		 * Queries the program for the types that exist within
		 * the specified document, at the specified type path.
		 * 
		 * @param document The document to query.
		 * @param typePath The type path within the document to search.
		 * 
		 * @returns A fully constructed Type instance that corresponds to
		 * the type at the URI specified, or null in the case when no type
		 * could be found.
		 */
		query(document: Document, ...typePath: string[]): Type | null;
		query(document: Document, ...typePath: string[]):
			readonly Type[] | Type | null
		{
			if (arguments.length > 1 && typePath.length === 0)
				throw Exception.passedArrayCannotBeEmpty("typePath");
			
			if (typePath.length === 0)
				return Type.constructRoots(document);
			
			const phrase = document.phrase.forwardDeep(typePath);
			return Type.construct(phrase);
		}
		
		/**
		 * Begin inspecting a document loaded
		 * into this program, a specific location.
		 */
		inspect(
			document: Document,
			line: number,
			offset: number): ProgramInspectionResult
		{
			const statement = document.read(line);
			const zone = statement.getZone(offset);
			const position = {
				line,
				offset
			};
			
			switch (zone)
			{
				case StatementZone.void:
					return new ProgramInspectionResult(position, zone, null, statement);
				
				// Return all the types in the declaration side of the parent.
				case StatementZone.whitespace:
				{
					const parent = document.getParentFromPosition(line, offset);
					if (parent instanceof Document)
						return new ProgramInspectionResult(position, zone, parent, statement);
					
					const types = parent.declarations
						.map(decl => decl.factor())
						.reduce((spines, s) => spines.concat(s), [])
						.map(spine => Type.construct(spine))
						.filter((type): type is Type => !!type);
					
					return new ProgramInspectionResult(position, zone, types, statement, null);
				}
				//
				case StatementZone.pattern:
				{
					// TODO: This should not be returning a PatternLiteral,
					// but rather a fully constructed IPattern object. This
					// code is only here as a shim.
					const patternTypes: Type[] = [];
					return new ProgramInspectionResult(position, zone, patternTypes, statement);
				}
				// Return all the types related to the specified declaration.
				case StatementZone.declaration:
				{
					const decl = statement.getDeclaration(offset);
					if (!decl)
						throw Exception.unknownState();
					
					const types = decl
						.factor()
						.map(spine => Type.construct(spine))
						.filter((type): type is Type => !!type);
					
					return new ProgramInspectionResult(position, zone, types, statement, decl);
				}
				// 
				case StatementZone.annotation:
				{
					const anno = statement.getAnnotation(offset);
					if (!anno)
						throw Exception.unknownState();
					
					const spine = statement.declarations[0].factor()[0];
					let base: Type[] | null = null;
					
					const type = Type.construct(spine);
					if (type)
					{
						const annoText = anno.boundary.subject.toString();
						base = type.bases.filter(b => b.name === annoText);
						base.push(type);
					}
					
					return new ProgramInspectionResult(position, zone, base, statement, anno);
				}
				case StatementZone.annotationVoid:
				{
					const anno = statement.getAnnotation(offset);
					const spine = statement.declarations[0].factor()[0];
					const type = Type.construct(spine);
					const foundObject = type ? [type] : null;
					
					return new ProgramInspectionResult(position, zone, foundObject, statement, anno);
				}
			}
			
			return new ProgramInspectionResult(position, zone, null, statement, null);
		}
		
		/**
		 * Performs a full verification of all documents loaded into the program.
		 * This Program's .faults field is populated with any faults generated as
		 * a result of the verification. If no documents loaded into this program
		 * has been edited since the last verification, verification is not re-attempted.
		 * 
		 * @returns A boolean value that indicates whether the verification passed.
		 */
		verify()
		{
			if (this.lastFullVerify && !this.version.newerThan(this.lastFullVerify))
				return this.lastFullVerifyResult;
			
			for (const doc of this.documents)
				for (const { statement } of doc.eachDescendant())
					this.verifyAssociatedDeclarations(statement);
			
			this.lastFullVerify = this.version;
			return this.lastFullVerifyResult = this.finalizeVerification();
		}
		
		/** Stores the version of this program when the last full verification occured. */
		private lastFullVerify: VersionStamp | null = null;
		
		/** Stores the result produced from the last full verification. */
		private lastFullVerifyResult = true;
		
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
		private verifyAssociatedDeclarations(statement: Statement)
		{
			if (!statement.isDisposed)
				for (const decl of statement.declarations)
					decl.factor().map(spine => 
						Type.construct(spine));
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
		private readonly unverifiedStatements: Statement[] = [];
		
		/** */
		private readonly unverifiedDocuments: Document[] = [];
		
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
			uri: KnownUri;
			scope: AttachmentScope;
		}
	}
	
	/**
	 * Gets information about the object that holds 
	 * the specified Program instance.
	 */
	function getHolderInfo(program: Program)
	{
		const ih = program.instanceHolder;
		
		return {
			uri: ih ? ih.uri : null,
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
			readonly uri: KnownUri | null,
			readonly callback: (data: any) => any,
			readonly scope: AttachmentScope)
		{ }
	}
	
	/**
	 * Describes a place in the program where a Cause is attached.
	 */
	export type AttachmentScope = Program | Document | Type;
}
