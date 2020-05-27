
namespace Truth
{
	/**
	 * The main object that stores a collection Truth documents,
	 * and provides APIs for verifying and inspecting them.
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
			this.versionOfLastDocSort = this._version;
			this.reader = Truth.createDefaultUriReader();
			
			this.on("documentAdd", doc =>
			{
				this.uncheckedDocuments.add(doc.id);
			});
			
			this.on("documentRemove", doc =>
			{
				this.uncheckedDocuments.delete(doc.id);
			});
			
			this.on("documentUriChange", () =>
			{
				this._version = VersionStamp.next();
			});
			
			this.cycleDetector = new CycleDetector(this);
			this.faults = new FaultService(this);
			this.phrases = new PhraseProvider(this);
			this.worker = new ConstructionWorker(this);
			
			this.namedTypes = new ContingentSetMap(this);
			this.foreignSupers = new ContingentSetMap(this);
			this.foreignSupervisors = new ContingentSetMap(this);
			this.surfaceTypes = new ContingentMap(this);
			this.submergedTypes = new ContingentMap(this);
		}
		
		/** @internal */
		readonly id = id();
		
		/** @internal */
		readonly cycleDetector: CycleDetector;
		
		/** @internal */
		readonly phrases: PhraseProvider;
		
		/** @internal */
		readonly worker: ConstructionWorker;
		
		/** */
		readonly faults: FaultService;
		
		/**
		 * Gets an incrementing stamp.
		 */
		get version()
		{
			return this._version;
		}
		private _version: VersionStamp;
		
		//# Documents
		
		/**
		 * Gets a readonly array of truth documents that have been loaded into
		 * this Program. The array is sorted topologically (dependencies before
		 * dependents).
		 */
		get documents(): readonly Document[]
		{
			if (this.version.newerThan(this.versionOfLastDocSort))
			{
				const docs = new Set<Document>();
				const recurse = (doc: Document) =>
				{
					for (const dep of doc.dependencies)
						recurse(dep);
					
					docs.add(doc);
				};
				
				for (const doc of this._documents)
					recurse(doc);
				
				this.versionOfLastDocSort = this.version;
				this._documents = Array.from(docs);
			}
			
			return this._documents;
		}
		private _documents: Document[] = [];
		private versionOfLastDocSort: VersionStamp;
		
		/**
		 * Override the default IUriReader used by the program.
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
		 * If the associatedUri param is unspecified, the URI for the document 
		 * becomes an auto-generated, auto-incrementing number.
		 * 
		 * For example, the first document added in this way is considered
		 * to have the URI "memory://memory/1.truth", the second being 
		 * "memory://memory/2.truth", and so on.
		 */
		async addDocument(
			source: InputSource = "",
			associatedUri: KnownUri = 
				KnownUri.fromName("", typeof source === "string" || Misc.isIterable(source) ? 
					Extension.truth :
					Extension.script))
		{
			this.maybeAddTraitClasses();
			
			const doc = await Document.new(
				this,
				associatedUri,
				source,
				d => this.saveDocument(d));
			
			return this.finalizeDocumentAdd(doc);
		}
		
		/**
		 * Adds a document to this program, by loading it from the specified
		 * URI. In the case when there has already been a document loaded
		 * from the URI specified, this pre-loaded document is returned.
		 * 
		 * @param documentUri The URI that will represent the source 
		 * location of the loaded document.
		 * 
		 * @param fallbackSource The source text or source object to load into
		 * the document by default. If omitted, the source will be loaded
		 * from the the URI specified in the `documentUri` argument.
		 * Use this argument when the source text of the document being
		 * added has already been loaded into a string by another means,
		 * or when more control of the actual loaded content is required.
		 */
		async addDocumentFromUri(
			documentUri: string | KnownUri,
			fallbackSource?: string | SourceObject)
		{
			const uri = typeof documentUri === "string" ?
				KnownUri.fromString(documentUri) :
				documentUri;
			
			if (!uri)
				throw Exception.invalidUri();
			
			const existingDoc = this.getDocumentByUri(uri);
			if (existingDoc)
				return existingDoc;
			
			// If the uri is a memory URI, the document has to already be 
			// loaded into memory, or it's an error.
			else if (uri.protocol === UriProtocol.memory)
				return Promise.resolve(Exception.invalidUri(uri.toString()));
			
			this.maybeAddTraitClasses();
			
			const promises = this.queue.get(uri);
			if (promises)
			{
				return new Promise<Document | Error>(resolve =>
				{
					promises.push(resolve as any);
				});
			}
			
			return new Promise<Document | Error>(async resolve =>
			{
				this.queue.set(uri, [resolve]);
				
				if (fallbackSource === undefined)
				{
					if (uri.extension === Extension.truth)
					{
						const loadedSourceText = await this.reader.tryRead(uri);
						if (loadedSourceText instanceof Error)
							return loadedSourceText;
						
						fallbackSource = loadedSourceText;
					}
					else if (uri.extension === Extension.script)
					{
						const loadedSourceObject = await Script.import(uri);
						if (loadedSourceObject instanceof Error)
							return loadedSourceObject;
						
						fallbackSource = loadedSourceObject;
					}
					else throw Exception.invalidArgument();
				}
				
				const docOrError = await Document.new(
					this,
					uri,
					fallbackSource,
					d => this.saveDocument(d));
				
				const resolveFns = this.queue.get(uri);
				if (resolveFns)
				{
					this.queue.delete(uri);
					for (const resolveFn of resolveFns)
						resolveFn(docOrError);
				}
				
				this.finalizeDocumentAdd(docOrError);
			});
		}
		
		/** */
		private finalizeDocumentAdd(docOrError: Document | Error)
		{
			if (docOrError instanceof Document)
			{
				this.uncheckedDocuments.add(docOrError.id);
				this.emit("documentAdd", docOrError);
			}
			
			return docOrError;
		}
		
		/**
		 * Adds the specified document to the internal list of documents.
		 */
		private saveDocument(doc: Document)
		{
			this._documents.push(doc);
		}
		
		/** Stores a queue of documents to resolve. */
		private readonly queue = 
			new Map<KnownUri, ((resolved: Document | Error) => void)[]>();
		
		//# Trait Classes
		
		/**
		 * Adds a surface-level Trait Class definition to this Program.
		 * Trait Classes that 
		 */
		declare(...traitClasses: Class[])
		{
			if (this._documents.length > 0)
				throw Exception.cannotDeclareTraitsOnNonEmptyProgram();
			
			for (const tc of traitClasses)
				if (this.traitClasses.some(am => am.name === tc.name))
					throw Exception.classAlreadyExists(tc.name);
			
			this.traitClasses.push(...traitClasses);
		}
		
		/**
		 * Creates the trait class document, and adds all declared trait classes
		 * to said document, if it has not already been done before for this Program.
		 */
		private maybeAddTraitClasses()
		{
			if (this.traitClasses.length === 0)
				return;
			
			this._traitClassDocument = Document.newTraitClassDocument(
				this,
				this.traitClasses);
			
			// Clear the trait classes out of memory, as these references are no
			// longer needed, which also has the effect of short-circuiting this
			// method.
			this.traitClasses.length = 0;
		}
		
		private readonly traitClasses: Class[] = [];
		
		/**
		 * @internal
		 * Stores a reference to this Program's trait class document.
		 * The trait class document will be null in the case when this
		 * Program has declared no traits, or when no document have
		 * been added to this Program.
		 */
		get traitClassDocument()
		{
			return this._traitClassDocument;
		}
		private _traitClassDocument: Document | null = null;
		
		//# Type Caching
		
		/**
		 * @internal
		 * Used by the Type constructor to notify the Program
		 * that a Type object was created.
		 */
		addType(type: Type, phraseId: number)
		{
			if (type.document.isVolatile)
			{
				const doc = type.document;
				const map = type.level === 1 ?
					this.surfaceTypesVolatile :
					this.submergedTypesVolatile;
				
				map.get(doc)?.set(phraseId, type) || map.set(doc, new Map([[phraseId, type]]));
				return;
			}
			
			const typeMap = type.level === 1 ?
				this.surfaceTypes :
				this.submergedTypes;
			
			typeMap.set(phraseId, type, type.document);
			const termLower = type.name.toLocaleLowerCase();
			this.namedTypes.add(termLower, type, type.document);
		}
		
		/**
		 * @internal
		 * Returns the Type with the specified phrase ID, in the specified document.
		 */
		getType(doc: Document, phraseId: number)
		{
			if (doc.isVolatile)
				return (
					this.surfaceTypesVolatile.get(doc)?.get(phraseId) ||
					this.submergedTypesVolatile.get(doc)?.get(phraseId) ||
					null);
			
			return (
				this.surfaceTypes.get(phraseId) || 
				this.submergedTypes.get(phraseId) || 
				null);
		}
		
		/** @internal */
		getSurfaceTypes(document: Document)
		{
			return document.isVolatile ?
				this.surfaceTypesVolatile.get(document)?.values() || new Set<Type>().values() :
				this.surfaceTypes.each(document);
		}
		
		/** @internal */
		getSubmergedTypes(document: Document)
		{
			return document.isVolatile ?
				this.submergedTypesVolatile.get(document)?.values() || new Set<Type>().values() :
				this.submergedTypes.each(document);
		}
		
		/** @internal */
		getForeignTypesReferencingTypeAsSuper(type: Type): ReadonlySet<Type>
		{
			return this.foreignSupers.get(type.id) || new Set();
		}
		
		/** @internal */
		setForeignSuper(superType: Type, subType: Type)
		{
			this.foreignSupers.add(superType.id, subType, subType.document);
		}
		
		/** @internal */
		getForeignTypesReferencingTypeAsSupervisor(type: Type): ReadonlySet<Type>
		{
			return this.foreignSupervisors.get(type.id) || new Set();
		}
		
		/** @internal */
		setForeignSupervisor(supervisorType: Type, subvisorType: Type)
		{
			this.foreignSupervisors.add(
				supervisorType.id,
				subvisorType,
				subvisorType.document);
		}
		
		/**
		 * Stores a map of all Types that have the given name.
		 */
		private readonly namedTypes: ContingentSetMap<string, Type>;
		
		/**
		 * Stores a map of all surface Types defined within the program.
		 * The types are keyed by the ID of the Type's supporting Phrase object.
		 */
		private readonly surfaceTypes: ContingentMap<number, Type>;
		
		/**
		 * Stores a map of the surface Types that are defined within volatile
		 * documents.
		 */
		private readonly surfaceTypesVolatile = 
			new WeakMap<Document, Map<number, Type>>();
		
		/**
		 * Stores a map of all submerged Types defined within the program.
		 * The types are keyed by the ID of the Type's supporting Phrase object.
		 */
		private readonly submergedTypes: ContingentMap<number, Type>;
		
		/**
		 * Stores a map of the surface Types that are defined within volatile
		 * documents.
		 */
		private readonly submergedTypesVolatile =
			new WeakMap<Document, Map<number, Type>>();
		
		/**
		 * Stores a map that provides a fast answer to the question:
		 * "do any types in this document have foreign type X as a super?"
		 * 
		 * The keys of the map are IDs of the foreign Type being targeted,
		 * and the values are the Types defined within the associated
		 * document that have the foreign Type as a super.
		 */
		private readonly foreignSupers: ContingentSetMap<number, Type>;
		
		/**
		 * Stores a map that provides a fast answer to the question:
		 * "do any types in this document have foreign type X as a supervisor?"
		 * 
		 * The keys of the map are IDs of the foreign Type being targeted,
		 * and the values are the Types defined within the associated
		 * document that have the foreign Type as a supervisor.
		 */
		private readonly foreignSupervisors: ContingentSetMap<number, Type>;
		
		//# Lookup related members
		
		/**
		 * 
		 */
		lookup(keyword: string)
		{
			const kw = keyword.toLocaleLowerCase();
			return this.namedTypes.get(kw) || new Set();
		}
		
		/**
		 * Iterates through all Types defined within this program.
		 * 
		 * @param minLevelFilter An optional minimum level of depth
		 * (inclusive) at which to yield Types.
		 * @param maxLevelFilter An optional The maximum level of
		 * depth (inclusive) at which to yield Types. Negative numbers
		 * indicate no maximum.
		 * @param documentFilter An optional document, or set of
		 * documents whose Types should be yielded.
		 */
		*scan(
			minLevelFilter = 1,
			maxLevelFilter = -1,
			documentFilter?: Document | readonly Document[])
		{
			if (maxLevelFilter < 0)
				maxLevelFilter = Number.MAX_SAFE_INTEGER;
			
			if (maxLevelFilter < minLevelFilter)
				return;
			
			const documents: readonly Document[] = 
				documentFilter instanceof Document ? [documentFilter] :
				Array.isArray(documentFilter) ? documentFilter :
				this.documents;
			
			// Optimization
			if (minLevelFilter === 1 && maxLevelFilter === 1)
			{
				for (const document of documents)
					for (const type of document.eachType())
						yield { type, document };
				
				return;
			}
			
			for (const document of documents)
			{
				const queue = Array.from(document.eachType());
				
				for (const type of queue)
				{
					if (type.level <= maxLevelFilter)
						queue.push(...type.containees);
					
					if (minLevelFilter <= type.level)
						yield { type, document };
				}
			}
		}
		
		//# Interpreter
		
		/**
		 * Interprets the specified truth information, in the context of this Program.
		 * 
		 * @param sourceText The truth information to interpret.
		 * @param dependencies An array of Document objects that are currently
		 * attached to this program, that should be inferred as dependencies of 
		 * the truth information provided. In the case when the argument is omitted,
		 * or is an empty array, this method uses all "leaf" documents (documents with
		 * no dependents) defined within this program.
		 * 
		 * @throws An exception if this program has no documents, or if the program
		 * is in an unverified state.
		 * 
		 * @returns A tuple whose first element is an array containing any faults
		 * that were generated during the interpretation of the sourceText, and
		 * whose following elements are the surface Types inferred from the
		 * provided truth information.
		 */
		interpret(
			sourceText: string,
			dependencies: readonly Document[] = []): [Fault[], Document]
		{
			// Use all leaf documents in the case when no dependencies are specified.
			const deps = dependencies.length === 0 ?
				this.documents.filter(d => d.dependents.length === 0).reverse() :
				dependencies;
			
			if (deps.length === 0)
				throw Exception.programHasNoDocuments();
			
			const volatileDoc = Document.newVolatile(this, sourceText, deps);
			if (this.check(volatileDoc))
				return [[], volatileDoc];
			
			return [this.faults.each(volatileDoc), volatileDoc];
		}
		
		//# Inspection related members
		
		/**
		 * @returns The loaded document with the specified URI.
		 */
		getDocumentByUri(uri: KnownUri | string)
		{
			const knownUri = uri instanceof KnownUri ?
				uri :
				KnownUri.fromString(uri);
			
			if (!knownUri)
				throw Exception.invalidArgument();
			
			for (const doc of this._documents)
				if (doc.uri === knownUri)
					return doc;
			
			return null;
		}
		
		/**
		 * Queries the program for the surface Types that exist within
		 * the specified document.
		 * 
		 * @param document The document to query.
		 * 
		 * @returns An array containing the surface Types that are
		 * defined within the specified document.
		 */
		queryAll(document: Document): Type[]
		{
			const surfaceTypes: Type[] = [];
			
			for (const phrase of Phrase.rootsOf(document))
			{
				const type = Type.construct(phrase);
				if (type !== null)
					surfaceTypes.push(type);
			}
			
			return surfaceTypes;
		}
		
		/**
		 * Queries the program for Types that exist in any loaded document,
		 * at the specified path.
		 * 
		 * @param typePath The Type path within all documents to search.
		 * @returns An array containing the Types discovered. In the case when
		 * discovered Types are part of a homograph, all Types participating in
		 * this homograph are included in the returned array.
		 */
		query(...typePath: string[]): Type[]
		{
			if (typePath.length === 0)
				throw Exception.passedArrayCannotBeEmpty("typePath");
			
			const results: Type[] = [];
			
			for (const document of this.documents)
			{
				for (const phrase of Phrase.fromPathComponents(document, typePath))
				{
					const type = Type.construct(phrase);
					if (type)
						results.push(type);
				}
			}
			
			return results;
		}
		
		/**
		 * Queries the program for the type that exists within
		 * the specified document, at the specified type path.
		 * 
		 * @param document The document to query.
		 * @param typePath The type path within the document to search.
		 * 
		 * @returns In the case when a single Type was detected that
		 * corresponds to the specified type path, this Type object is
		 * returned.
		 * 
		 * In the case when a homograph was detected in the type path, an
		 * array is returned that contains all members of the homograph.
		 * 
		 * In the case when no type could be constructed from the specified
		 * type path, null is returned.
		 */
		queryDocument(document: Document, ...typePath: string[]): Type | readonly Type[] | null
		{
			if (typePath.length === 0)
				throw Exception.passedArrayCannotBeEmpty("typePath");
			
			const phrases = Phrase.fromPathComponents(document, typePath);
			if (phrases.length === 0)
				return null;
			
			const types = phrases
				.map(ph => Type.construct(ph))
				.filter((type): type is Type => !!type);
			
			return types.length === 1 ? types[0] : types;
		}
		
		/**
		 * Queries the program for the type that exists within
		 * the specified document, at the specified type path, 
		 * using a homograph clarifier.
		 * 
		 * @param document The document to query.
		 * @param typePath The type path within the document to search.
		 * 
		 * @returns The type object that corresponds to the specified type path,
		 * or null in the case when no type could be constructed from the specified
		 * type path.
		 */
		queryWithClarifier(
			document: Document,
			typePath: string | string[],
			clarifier: string | string[]): Type | null
		{
			if (typePath === "" || typePath.length === 0)
				throw Exception.passedArrayCannotBeEmpty("typePath");
			
			const phrase = Phrase.fromPathComponents(
				document,
				typeof typePath === "string" ? [typePath] : typePath,
				typeof clarifier === "string" ? [clarifier] : clarifier);
			
			return phrase ? Type.construct(phrase) : null;
		}
		
		/**
		 * Returns the Truth.Type object that corresponds to the Truth.Class
		 * specified. Alternatively, a Truth.Type object may be specified, in
		 * which case, it is returned verbatim. This way, an identifier that is
		 * a union of Type | Class can be easily resolved to just Type.
		 */
		declassify(construct: Construct): Type;
		/**
		 * Returns the Truth.Type object that corresponds to a path of
		 * Truth.Class references. Returns null in the case when the path
		 * refers to a non-existent area.
		 */
		declassify(classPath1: Class, ...classPathNext: Class[]): Type | null;
		declassify(...classPath: any[]): any
		{
			if (classPath[0] instanceof Type)
				return classPath[0];
			
			if (this.traitClassDocument === null)
				return null;
			
			const names = classPath.map(cls => cls.name);
			const result = this.queryDocument(this.traitClassDocument, ...names);
			if (result === null)
				return null;
			
			if (result instanceof Truth.Type)
				return result;
			
			throw Exception.unknownState();
		}
		
		/**
		 * Returns an object that provides contextual information about a specific
		 * location in the specified document.
		 * 
		 * @param document The document to inspect.
		 * @param line A 1-based line number at which to begin inspecting.
		 * @param column A 1-based column number at which to begin inspecting.
		 */
		inspect(
			document: Document,
			line: number,
			column: number): ProgramInspectionResult
		{
			const offset = column - 1;
			const statement = document.read(line);
			const zone = statement.getZone(offset);
			const declSpan = statement.getDeclaration(offset);
			const annoSpan = statement.getAnnotation(offset);
			const span = declSpan || annoSpan;
			
			const area: InspectedArea =
				declSpan || zone === StatementZone.declarationWhitespace ? 
					InspectedArea.declaration :
				annoSpan || zone === StatementZone.annotationWhitespace ? 
					InspectedArea.annotation :
					InspectedArea.void;
			
			const syntax: InspectedSyntax =
				zone === StatementZone.joint ?
					InspectedSyntax.joint :
				zone === StatementZone.annotationCombinator ||
				zone === StatementZone.declarationCombinator ? 
					InspectedSyntax.combinator :
				zone === StatementZone.whitespace ||
				zone === StatementZone.annotationWhitespace ||
				zone === StatementZone.declarationWhitespace ?
					InspectedSyntax.void :
					InspectedSyntax.term;
			
			return new ProgramInspectionResult(
				line,
				column,
				statement,
				span,
				area,
				syntax);
		}
		
		//# Mutation related members
		
		/** 
		 * Starts an edit transaction in the specified callback function.
		 * Edit transactions are used to synchronize changes made in
		 * an underlying file, typically done by a user in a text editing
		 * environment. System-initiated changes such as automated
		 * fixes, refactors, or renames do not go through this pathway.
		 * 
		 * @param editFn The callback function in which to perform
		 * document mutation operations.
		 * 
		 * @returns A promise that resolves any external document
		 * references added during the edit operation have been resolved.
		 * If no such references were added, a promise is returned that
		 * resolves immediately.
		 */
		async edit(editFn: (mutator: IProgramMutator) => void)
		{
			if (this.inEdit)
				throw Exception.doubleTransaction();
			
			this.inEdit = true;
			const edits: TEdit[] = [];
			const documentsEdited = new Set<Document>();
			
			editFn({
				insert: (doc: Document, text: string, pos = -1) =>
				{
					edits.push(new InsertEdit(Statement.new(doc, text), pos));
					documentsEdited.add(doc);
				},
				update: (doc: Document, text: string, pos = -1) =>
				{
					if (doc.read(pos).sourceText !== text)
					{
						edits.push(new UpdateEdit(Statement.new(doc, text), pos));
						documentsEdited.add(doc);
					}
				},
				delete: (doc: Document, pos = -1, count = 1) =>
				{
					if (count > 0)
					{
						edits.push(new DeleteEdit(doc, pos, count));
						documentsEdited.add(doc);
					}
				}
			});
			
			if (edits.length > 0)
			{
				this.cancelCheckAsync();
				const tasks: IDocumentMutationTask[] = [];
				
				for (const doc of documentsEdited)
				{
					const task = doc.createMutationTask(edits.filter(ed => ed.document));
					if (task)
						tasks.push(task);
				}
				
				this.faults.executeTransaction(async () =>
				{
					for (const task of tasks)
						task.deletePhrases();
					
					for (const task of tasks)
						task.updateDocument();
					
					this.faults.prune();
					
					for (const task of tasks)
						task.createPhrases();
					
					for await (const task of tasks)
						await task.finalize();
				});
				
				this._version = VersionStamp.next();
			}
			
			this.inEdit = false;
		}
		
		/**
		 * Executes a complete edit transaction, applying the series
		 * of edits specified in the `edits` parameter. 
		 * 
		 * @returns A promise that resolves any external document
		 * references added during the edit operation have been resolved.
		 * If no such references were added, a promise is returned that
		 * resolves immediately.
		 */
		async editAtomic(edits: IProgramEdit[])
		{
			return this.edit(statements =>
			{
				for (const editInfo of edits)
				{
					if (!editInfo.range)
						throw new TypeError("No range included.");
					
					const segments = editInfo.text.split("\n");
					const doc = editInfo.document;
					
					if (doc.length === 0)
					{
						for (const segment of segments)
							statements.insert(doc, segment);
						
						return;
					}
					
					const startLine = editInfo.range.startLineNumber;
					const endLine = editInfo.range.endLineNumber;
					
					// Convert these to 0-based, because the incoming 
					// column data is 1-based.
					const startChar = editInfo.range.startColumn - 1;
					const endChar = editInfo.range.endColumn - 1;
					
					const startLineText = doc.read(startLine).sourceText;
					const endLineText = doc.read(endLine).sourceText;
					
					const prefixSegment = startLineText.slice(0, startChar);
					const suffixSegment = endLineText.slice(endChar);
					
					const pastCount = endLine - startLine + 1;
					const presentCount = segments.length;
					const deltaCount = presentCount - pastCount;
					
					// Detect the pure update cases
					if (deltaCount === 0)
					{
						if (pastCount === 1)
						{
							statements.update(
								doc,
								prefixSegment + editInfo.text + suffixSegment, 
								startLine);
						}
						else
						{
							statements.update(doc, prefixSegment + segments[0], startLine);
							
							for (let i = startLine; i <= endLine; i++)
							{
								statements.update(
									doc,
									prefixSegment + segments[i] + suffixSegment,
									startLine);
							}
							
							statements.update(
								doc,
								segments.slice(-1)[0] + suffixSegment,
								endLine);
						}
						
						continue;
					}
					
					// Detect the pure delete cases
					if (deltaCount < 0)
					{
						const deleteCount = deltaCount * -1;
						
						// Detect a delete ranging from the end of 
						// one line, to the end of a successive line
						if (startChar === startLineText.length)
							if (endChar === endLineText.length)
							{
								statements.delete(doc, startLine + 1, deleteCount);
								continue;
							}
						
						// Detect a delete ranging from the start of
						// one line to the start of a successive line
						if (startChar + endChar === 0)
						{
							statements.delete(doc, startLine, deleteCount);
							continue;
						}
					}
					
					// Detect the pure insert cases
					if (deltaCount > 0)
					{
						// Cursor is at the end of the line, and the first line of the 
						// inserted content is empty (most likely, enter was pressed)						
						if (startChar === startLineText.length && segments[0] === "")
						{
							for (let i = 0; ++i < segments.length;)
								statements.insert(doc, segments[i], startLine + i);
							
							continue;
						}
						
						// Cursor is at the beginning of the line, and the
						// last line of the inserted content is empty.
						if (startChar === 0 && segments.slice(-1)[0] === "")
						{
							for (let i = -1; ++i < segments.length - 1;)
								statements.insert(doc, segments[i], startLine + i);
							
							continue;
						}
					}
					
					// This is the "fallback" behavior -- simply delete everything
					// that is old, and insert everything that is new.
					const deleteCount = endLine - startLine + 1;
					statements.delete(doc, startLine, deleteCount);
					
					const insertLines = segments.slice();
					insertLines[0] = prefixSegment + insertLines[0];
					insertLines[insertLines.length - 1] += suffixSegment;
					
					for (let i = -1; ++i < insertLines.length;)
						statements.insert(doc, insertLines[i], startLine + i);
				}
			});
		}
		
		/**
		 * A state variable that stores whether an
		 * edit transaction is currently underway.
		 */
		private inEdit = false;
		
		//# Correctness check related members
		
		/**
		 * Performs a synchronous, as-fast-as-possible correctness check of all
		 * information contained in this program.
		 * 
		 * Caution should be used when invoking this method––in large programs,
		 * use of this overload could potentially block the main thread.
		 * 
		 * @returns A boolean value indicating whether the program was determined
		 * to be free of faults.
		 */
		check(): boolean;
		/**
		 * Performs a synchronous correctness check of the document provided,
		 * and all documents in it's dependency graph.
		 * 
		 * @returns A boolean value indicating whether the program was determined
		 * to be free of faults.
		 */
		check(document: Document): boolean;
		check(document: Document | null = null)
		{
			if (document)
			{
				if (document.isVolatile)
				{
					// In the case when a volatile document is being checked,
					// the volatile type maps need to be cleared manually, 
					// because there is no such thing as a "ContingentWeakMap".
					// This prevents the situation where a volatile document is 
					// checked twice, and the same Type is saved multiple times.
					this.surfaceTypesVolatile.delete(document);
					this.submergedTypesVolatile.delete(document);
				}
				// Only start & restart the async checking process for non-volatile
				// documents. In order to process a volatile document, the entire
				// program should be in a fully checked state.
				else this.cancelCheckAsync();
				
				// Check all documents that are unchecked,
				// that are in the dependency graph of the 
				// provided document.
				for (const dep of document.traverseDependencies())
					if (this.uncheckedDocuments.has(dep.id))
						this.checkDocument(dep);
				
				this.checkDocument(document);
				
				if (document.isVolatile)
					return this.faults.each(document).length === 0;
			}
			else
			{
				this.cancelCheckAsync();
				
				// Check all documents that are unchecked
				for (const doc of this.documents)
					if (this.uncheckedDocuments.has(doc.id))
						this.checkDocument(doc);
			}
			
			this.faults.refresh();
			this.checkAsync();
			return this.faults.count === 0;
		}
		
		/**
		 * Synchronously checks all phrases in the specified document.
		 */
		private checkDocument(document: Document)
		{
			for (const phrases of document.phrase.peekRecursive())
				for (const phrase of phrases)
					Type.construct(phrase);
			
			this.uncheckedDocuments.delete(document.id);
		}
		
		/**
		 * Launches an asynchronous "background" process (in the form
		 * of a recurring timeout) that runs the correctness check on the
		 * unchecked parts of the program.
		 */
		private checkAsync()
		{
			const invoke = (fn: () => void) =>
			{
				this.checkAsyncTimeoutId = hasRaf ?
					window.requestAnimationFrame(fn) :
					setTimeout(fn);
			};
			
			const self = this;
			
			function *createGenerator()
			{
				for (const document of self.documents)
					for (const phrases of document.phrase.peekRecursive())
						for (const phrase of phrases)
							yield phrase;
			};
			
			const generator = createGenerator();
			const maxIterationsPerTurn = 50;
			let iterationCount = 0;
			
			const callback = () =>
			{
				for (;;)
				{
					const iteratorResult = generator.next();
					
					if (iteratorResult.done)
						return void this.emit("verificationComplete", this);
					
					if (++iterationCount > maxIterationsPerTurn)
						return invoke(callback);
				}
			};
			
			invoke(callback);
		}
		
		/** */
		private cancelCheckAsync()
		{
			hasRaf ?
				window.cancelAnimationFrame(this.checkAsyncTimeoutId) :
				clearTimeout(this.checkAsyncTimeoutId);
		}
		private checkAsyncTimeoutId = -1;
		
		/**
		 * @internal
		 */
		uncheckDocument(document: Document)
		{
			this.uncheckedDocuments.add(document.id);
			this.emit("documentUnchecked", document);
			
			for (const dep of document.traverseDependents())
			{
				this.uncheckedDocuments.add(dep.id);
				this.emit("documentUnchecked", dep);
			}
		}
		
		/**
		 * Gets whether the specified document has unchecked information
		 * and is in need of a correctness check.
		 */
		isUnchecked(document: Document)
		{
			return this.uncheckedDocuments.has(document.id);
		}
		
		/**
		 * Stores the IDs of documents that are currently in an unchecked state.
		 */
		private readonly uncheckedDocuments = new Set<number>();
		
		//# Event related members
		
		/**
		 * Attaches a callback function that will be called in response
		 * to the specified program event.
		 */
		on<K extends keyof ProgramEventMap>(
			eventName: K,
			handler: ProgramEventMap[K]): ProgramEventMap[K]
		{
			this.handlers.add(eventName, handler);
			return handler;
		}
		
		/**
		 * Attaches a callback function that will be only be called once,
		 * in response to the next occurence of the specified program event.
		 */
		once<K extends keyof ProgramEventMap>(
			eventName: K,
			handler: ProgramEventMap[K]): ProgramEventMap[K]
		{
			this.handlersOnce.add(handler);
			this.handlers.add(eventName, handler);
			return handler;
		}
		
		/**
		 * Removes a callback function previously attached to this Program
		 * instance, through the specified event name.
		 */
		off<K extends keyof ProgramEventMap>(
			eventName: K,
			handler: ProgramEventMap[K]): ProgramEventMap[K];
		/**
		 * Removes a callback function previously attached to this Program
		 * instance, through any event name.
		 */
		off<K extends keyof ProgramEventMap>(
			handler: ProgramEventMap[K]): ProgramEventMap[K]
		/** */
		off<K extends keyof ProgramEventMap>(
			maybeEventName: K | ProgramEventMap[K],
			handler?: ProgramEventMap[K])
		{
			const handlerFn = typeof handler === "function" ?
				handler :
				maybeEventName as ProgramEventMap[K];
			
			if (handler)
				this.handlers.delete(maybeEventName as string, handlerFn);
			
			else for (const [eventName] of this.handlers)
				this.handlers.delete(eventName, handlerFn);
			
			return handlerFn;
		}
		
		/**
		 * @internal
		 * Emits an event with the specified parameters to all callback
		 * functions attached to this Program instance via the on() method.
		 * 
		 * @returns A promise that resolves when all event handlers have
		 * completed.
		 */
		emit<K extends keyof ProgramEventMap>(
			eventName: K,
			...params: Parameters<ProgramEventMap[K]>): Promise<void>
		{
			const functions = this.handlers.get(eventName);
			if (!functions || functions.length === 0)
				return Promise.resolve();
			
			const stored = functions.slice();
			this.outstandingEmits++;
			
			return new Promise(resolve =>
			{
				setTimeout(() =>
				{
					for (const fn of stored)
					{
						fn(...params);
						this.handlersOnce.delete(fn);
					}
					
					if (this.outstandingEmits < 2)
					{
						this.outstandingEmits = 0;
						const queue = this.waitQueue.slice();
						this.waitQueue.length = 0;
						
						for (const fn of queue)
							fn();
					}
					else this.outstandingEmits--;
					
					resolve();
				});
			});
		}
		
		private outstandingEmits = 0;
		private readonly waitQueue: (() => void)[] = [];
		
		/**
		 * Returns a promise that resolves when all program event handlers
		 * have returned.
		 */
		async wait(): Promise<void>
		{
			return this.outstandingEmits > 0 ?
				new Promise(r => this.waitQueue.push(r)) :
				Promise.resolve();
		}
		
		/** @internal */
		hasHandlers(eventName: keyof ProgramEventMap)
		{
			const handlers = this.handlers.get(eventName);
			return !!handlers && handlers.length > 0;
		}
		
		/**
		 * A MultiMap of all event handlers attached to this Program instance,
		 * keyed by the name of the event to which the handler is attached.
		 */
		private readonly handlers = new MultiMap<string, (...args: any[]) => void>();
		
		/**
		 * Stores the handlers that have been attached via the .once() method.
		 */
		private readonly handlersOnce = new WeakSet<(...args: any[]) => void>();
	}
	
	/** 
	 * Whether or not the window.requestAnimationFrame() method is available
	 * in the host JavaScript environment.
	 */
	const hasRaf = 
		typeof window === "object" &&
		typeof window.requestAnimationFrame === "function";
}
