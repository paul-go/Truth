
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
		constructor(options?: IProgramOptions)
		{
			this.options = options || { autoVerify: true };
			this._version = VersionStamp.next();
			this.reader = Truth.createDefaultUriReader();
			
			this.on("documentCreate", doc =>
			{
				this.markPhrase(doc.phrase);
			});
			
			this.on("documentDelete", doc =>
			{
				for (const phrases of doc.phrase.peekRecursive())
					for (const phrase of phrases)
						this.unmarkPhrase(phrase);
			});
			
			this.on("documentUriChange", () =>
			{
				this._version = VersionStamp.next();
			});
			
			this.cycleDetector = new CycleDetector(this);
			this.faults = new FaultService(this);
		}
		
		/** @internal */
		private readonly options: IProgramOptions;
		
		/** @internal */
		readonly cycleDetector: CycleDetector;
		
		/**  */
		readonly faults: FaultService;
		
		/**
		 * Gets a readonly array of truth documents
		 * that have been loaded into this Program.
		 */
		get documents(): readonly Document[]
		{
			return this._documents;
		}
		private readonly _documents: Document[] = [];
		
		/**
		 * Gets an incrementing stamp.
		 */
		get version()
		{
			return this._version;
		}
		private _version: VersionStamp;
		
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
		 * @param source The source text or source object to load into
		 * the document by default. If omitted, the source will be loaded
		 * from the the URI specified in the `documentUri`  argument.
		 * 
		 * Use this argument when the source text of the document being
		 * added has already been loaded into a string by another means,
		 * or when more control of the actual loaded content is required.
		 */
		async addDocumentFromUri(
			documentUri: string | KnownUri,
			source?: string | SourceObject)
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
			
			return new Promise<Document | Error>(async resolve =>
			{
				this.queue.set(uri, [resolve]);
				
				if (source === undefined)
				{
					if (uri.extension === Extension.truth)
					{
						const loadedSourceText = await this.reader.tryRead(uri);
						if (loadedSourceText instanceof Error)
							return loadedSourceText;
						
						source = loadedSourceText;
					}
					else if (uri.extension === Extension.script)
					{
						const loadedSourceObject = await Script.import(uri);
						if (loadedSourceObject instanceof Error)
							return loadedSourceObject;
						
						source = loadedSourceObject;
					}
					else throw Exception.invalidArgument();
				}
				
				const docOrError = await Document.new(
					this,
					uri,
					source,
					d => this.saveDocument(d));
				
				const resolveFns = this.queue.get(uri);
				if (resolveFns)
				{
					this.queue.delete(uri);
					for (const resolveFn of resolveFns)
						resolveFn(docOrError);
				}
				
				if (docOrError instanceof Document)
					this.emit("documentCreate", docOrError);
			});
		}
		
		/** Stores a queue of documents to resolve. */
		private readonly queue = new Map<KnownUri, ((resolved: Document | Error) => void)[]>();
		
		/**
		 * Adds the specified document to the internal list of documents.
		 */
		private saveDocument(doc: Document)
		{
			this._documents.push(doc);
		}
		
		//# Inspection related members
		
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
		 * Queries the program for the root-level types that exist within
		 * the specified document.
		 * 
		 * @param document The document to query.
		 * 
		 * @returns An array containing the top-level types that are
		 * defined within the specified document.
		 */
		queryAll(document: Document): Type[]
		{
			const roots: Type[] = [];
			
			for (const phrase of Phrase.rootsOf(document))
			{
				const type = Type.construct(phrase);
				if (type !== null)
					roots.push(type);
			}
			
			return roots;
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
		 * In the case when a homograph was detected in the type path, a
		 * number representing the number of members in the homograph
		 * is returned.
		 * 
		 * In the case when no type could be constructed from the specified
		 * type path, 0 is returned.
		 */
		query(document: Document, ...typePath: string[]): Type | number
		{
			if (typePath.length === 0)
				throw Exception.passedArrayCannotBeEmpty("typePath");
			
			const phrases = Phrase.fromPathComponents(document, typePath);
			if (phrases.length === 0)
				return 0;
			
			const types = phrases
				.map(ph => Type.construct(ph))
				.filter((type): type is Type => !!type);
			
			return types.length === 1 ? types[0] : types.length;
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
		 * Returns an object that provides contextual information about a specific
		 * location in the specified document.
		 */
		inspect(
			document: Document,
			line: number,
			offset: number): ProgramInspectionResult
		{
			const statement = document.read(line);
			const zone = statement.getZone(offset);
			const position = { line, offset };
			
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
						.flatMap(decl => Phrase.fromSpan(decl))
						.map(phrase => Type.construct(phrase))
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
					
					const types = Phrase.fromSpan(decl)
						.map(phrase => Type.construct(phrase))
						.filter((type): type is Type => !!type);
					
					return new ProgramInspectionResult(position, zone, types, statement, decl);
				}
				// 
				case StatementZone.annotation:
				{
					const anno = statement.getAnnotation(offset);
					if (!anno)
						throw Exception.unknownState();
					
					let base: Type[] | null = null;
					
					// We can safely construct phrases from the first declaration,
					// because all phrases returned in this case are going to allow
					// us to arrive at the relevant annotation.
					const phrases = Phrase.fromSpan(statement.declarations[0]);
					if (phrases.length > 0)
					{
						// We can safely construct a type from the first phrase, because
						// we don't actually care about any of the phrases in this case,
						// but rather, a particular annotation which will be associated
						// with any of the returned phrases.
						const type = Type.construct(phrases[0]);
						if (type)
						{
							const annoText = anno.boundary.subject.toString();
							base = type.bases.filter(t => t.name === annoText);
							base.push(type);
						}
					}
					
					return new ProgramInspectionResult(position, zone, base, statement, anno);
				}
				//
				case StatementZone.annotationVoid:
				{
					const anno = statement.getAnnotation(offset);
					const phrases = Phrase.fromSpan(statement.declarations[0]);
					const types = phrases
						.map(ph => Type.construct(ph))
						.filter((type): type is Type => !!type);
					
					const foundObject = types.length ? types : null;
					
					return new ProgramInspectionResult(position, zone, foundObject, statement, anno);
				}
			}
			
			return new ProgramInspectionResult(position, zone, null, statement, null);
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
				this.cancelVerification();
				
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
				
				if (this.options.autoVerify && this.markedPhrases.size > 0)
					this.await();
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
		
		//# Verification related members
		
		/**
		 * Gets the program's verification stage.
		 */
		get verificationStage()
		{
			return this._verificationStage;
		}
		private _verificationStage = VerificationStage.none;
		
		/**
		 * Returns a promise that resolves when this program's verification stage
		 * has reached the stage specified.
		 * 
		 * This method will launch a verification cycle in the case when the program
		 * contains unverified information, and no other verification cycle has been
		 * launched.
		 * 
		 * When the returned promise resolves, this Program's .faults field will be
		 * populated with any faults generated as a result of the verification.
		 */
		async await(resolveStage = VerificationStage.included): Promise<void>
		{
			// If the verification stage is already past the point of the stage
			// specified in the argument, we can resolve the promise immediately.
			if (resolveStage <= this._verificationStage)
				return Promise.resolve();
			
			// If there is already a verification cycle underway, then return
			// a new promise that resolves when the verification cycle has
			// reached the stage specified
			if (this.verificationStage > VerificationStage.none)
			{
				switch (resolveStage)
				{
					case VerificationStage.started:
						return new Promise(r => this.startedResolveFns.push(r));
					
					case VerificationStage.marked:
						return new Promise(r => this.markedResolveFns.push(r));
					
					case VerificationStage.affected:
						return new Promise(r => this.affectedResolveFns.push(r));
					
					case VerificationStage.included:
						return new Promise(r => this.includedResolveFns.push(r));
				}
			}
			
			// At this point, it has been determined that no verification
			// cycle is underway, and so one needs to be launched.
			
			const massResolve = (resolveFns: (() => void)[]) =>
			{
				const fns = resolveFns.slice();
				resolveFns.length = 0;
				
				for (const fn of fns)
					fn();
			};
			
			this._verificationStage = VerificationStage.started;
			massResolve(this.startedResolveFns);
			
			// Run "marked" verifications
			await new Promise(resolve =>
			{
				const next = () =>
				{
					if (this.markedPhrases.size === 0)
						return resolve();
					
					const nextPhrase: Phrase = this.markedPhrases.values().next().value;
					this.markedPhrases.delete(nextPhrase);
					Type.construct(nextPhrase);
					this.nextVerificationTimeout = setTimeout(next, 0);
				};
				
				next();
			});
			
			// Indicate that the system has now begun to work on
			// the affected set of phrases.
			this._verificationStage = VerificationStage.marked;
			this.faults.refresh();
			massResolve(this.markedResolveFns);
			
			// Shared code between "affected" and "included" verifications
			const maxConstructionsPerTurn = 50;
			
			const affectedDocuments = (() =>
			{
				const docs = new Set<Document>();
				
				for (const markedDoc of this.markedDocuments)
					Misc.reduceRecursive(
						markedDoc,
						doc => doc.dependents,
						doc => docs.add(doc));
				
				return Array.from(docs);
			})();
			
			const includedDocuments = this._documents.slice()
				.filter(doc => !affectedDocuments.includes(doc));
			
			const verifyDocuments = (docs: Document[], resolve: () => void) =>
			{
				const allPhrases: Phrase[] = [];
				
				for (const doc of docs)
					for (const phrases of doc.phrase.peekRecursive())
						allPhrases.push(...phrases);
				
				if (allPhrases.length === 0)
					return resolve();
				
				const next = () =>
				{
					const phrases = allPhrases.slice(-maxConstructionsPerTurn);
					allPhrases.length = Math.max(0, allPhrases.length - maxConstructionsPerTurn);
					
					for (const phrase of phrases)
						Type.construct(phrase);
					
					if (allPhrases.length === 0)
						return resolve();
					
					this.nextVerificationTimeout = setTimeout(next, 0);
				};
				
				next();
			}
			
			// Run "affected" verifications
			await new Promise(resolve =>
			{
				verifyDocuments(affectedDocuments, resolve);
			});
			
			this._verificationStage = VerificationStage.affected;
			this.faults.refresh();
			massResolve(this.affectedResolveFns);
			
			// Run "included" verifications
			await new Promise(resolve =>
			{
				verifyDocuments(includedDocuments, resolve);
			});
			
			this._verificationStage = VerificationStage.included;
			this.faults.refresh();
			massResolve(this.includedResolveFns);
			
			// Reset the verification stage back to its initial value.
			this._verificationStage = VerificationStage.none;
			
			this.emit("verificationComplete", this);
		}
		
		/** */
		private cancelVerification()
		{
			this._verificationStage = VerificationStage.none;
			
			if (this.nextVerificationTimeout !== null)
			{
				clearTimeout(this.nextVerificationTimeout);
				this.nextVerificationTimeout = null;
			}
		}
		
		private readonly startedResolveFns: (() => void)[] = [];
		private readonly markedResolveFns: (() => void)[] = [];
		private readonly affectedResolveFns: (() => void)[] = [];
		private readonly includedResolveFns: (() => void)[] = [];
		private nextVerificationTimeout: NodeJS.Timeout | null = null;
		
		/**
		 * @internal
		 */
		markPhrase(target: Phrase)
		{
			this.markedPhrases.add(target);
			this.markedDocuments.maybeAdd(target.containingDocument);
		}
		
		/**
		 * @internal
		 * Removes the specified Phrase from the verification queue.
		 * 
		 * @returns A boolean value indicating whether the phrase
		 * was in the verification queue before being removed.
		 */
		unmarkPhrase(target: Phrase)
		{
			this.markedPhrases.delete(target);
			this.markedDocuments.maybeDelete(target.containingDocument);
		}
		
		/**
		 * Stores an unsorted set of Phrases associated with any document
		 * in the program that have been queued for verification.
		 */
		private readonly markedPhrases = new Set<Phrase>();
		
		/**
		 * 
		 */
		private readonly markedDocuments = new ReferenceCountedSet<Document>();
		
		//# Lookup  related members
		
		/**
		 * 
		 */
		lookup(keyword: string)
		{
			return Type.lookup(keyword, this);
		}
		
		/**
		 * Iterates through all types defined within this program.
		 * 
		 * @param minLevelFilter An optional minimum level of depth
		 * (inclusive) at which to yield types.
		 * @param maxLevelFilter An optional The maximum level of
		 * depth (inclusive) at which to yield types. Negative numbers
		 * indicate no maximum.
		 * @param documentFilter An optional document, or set of
		 * documents whose types should be yielded.
		 */
		*scan(
			minLevelFilter = 1,
			maxLevelFilter = -1,
			documentFilter?: Document | Document[])
		{
			if (maxLevelFilter < minLevelFilter)
				return;
			
			if (maxLevelFilter < 0)
				maxLevelFilter = Number.MAX_SAFE_INTEGER;
			
			const documents = 
				documentFilter instanceof Document ? [documentFilter] :
				Array.isArray(documentFilter) ? documentFilter :
				this.eachDocument();
			
			// Optimization
			if (minLevelFilter === 1 && maxLevelFilter === 1)
			{
				for (const document of documents)
					for (const type of document.types)
						yield { type, document };
				
				return;
			}
			
			for (const document of documents)
			{
				const queue = document.types.slice();
				
				for (const type of queue)
				{
					if (type.level <= maxLevelFilter)
						queue.push(...type.containees);
					
					if (minLevelFilter <= type.level)
						yield { type, document };
				}
			}
		}
		
		/**
		 * Recurses through all documents loaded into this program,
		 * in topological order.
		 */
		private *eachDocument()
		{
			const visited = new Set<Document>();
			
			function *recurse(doc: Document): IterableIterator<Document>
			{
				for (const dep of doc.dependencies)
				{
					if (!(visited.has(dep)))
					{
						visited.add(dep);
						yield *recurse(dep)
					}
				}
				
				yield doc;
			}
			
			for (const doc of this._documents)
				yield *recurse(doc);
		}
		
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
		 * Emits an event with the specified parameters to all callback functions
		 * attached to this Program instance via the on() method.
		 */
		emit<K extends keyof ProgramEventMap>(
			eventName: K,
			...params: Parameters<ProgramEventMap[K]>)
		{
			const functions = this.handlers.get(eventName);
			if (functions)
				for (const fn of functions)
					fn(...params);
		}
		
		/**
		 * A MultiMap of all event handlers attached to this Program instance,
		 * keyed by the name of the event to which the handler is attached.
		 */
		private readonly handlers = new MultiMap<string, (...args: any[]) => void>();
	}
}
