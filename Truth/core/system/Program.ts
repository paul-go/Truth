
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
			
			this.on("documentCreate", doc =>
			{
				this.queueVerification(doc.phrase);
			});
			
			this.on("documentDelete", doc =>
			{
				for (const phrases of doc.phrase.peekRecursive())
					for (const phrase of phrases)
						this.cancelVerification(phrase);
			});
			
			this.on("documentUriChange", () =>
			{
				this._version = VersionStamp.next();
			});
			
			this.cycleDetector = new CycleDetector(this);
			this.faults = new FaultService(this);
		}
		
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
				delete: (doc: Document, pos = -1, count = 1) =>
				{
					if (count > 0)
					{
						edits.push(new DeleteEdit(doc, pos, count));
						documentsEdited.add(doc);
					}
				},
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
				}
			});
			
			if (edits.length > 0)
			{
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
					
					const doc = editInfo.document;
					const startLine = editInfo.range.startLineNumber;
					const endLine = editInfo.range.endLineNumber;
					
					const startChar = editInfo.range.startColumn;
					const endChar = editInfo.range.endColumn;
					
					const startLineText = doc.read(startLine).sourceText;
					const endLineText = doc.read(endLine).sourceText;
					
					const prefixSegment = startLineText.slice(0, startChar);
					const suffixSegment = endLineText.slice(endChar);
					
					const segments = editInfo.text.split("\n");
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
		 * Performs a full verification of all documents loaded into the program.
		 * This Program's .faults field is populated with any faults generated as
		 * a result of the verification. If no documents loaded into this program
		 * have been edited since the last verification, no verification is attempted.
		 * 
		 * @returns A boolean value that indicates whether the verification passed.
		 */
		verify(targetDocument?: Document)
		{
			if (this.lastFullVerify && !this.version.newerThan(this.lastFullVerify))
				return this.lastFullVerifyResult;
			
			const documents = targetDocument ?
				[targetDocument] :
				this.documents;
			
			for (const doc of documents)
				for (const phrases of doc.phrase.peekRecursive())
					for (const phrase of phrases)
						Type.construct(phrase);
			
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
		verifyIncremental()
		{
			for (const phrase of this.verificationQueue)
				if (!phrase.isDisposed)
					Type.construct(phrase);
			
			return this.finalizeVerification();
		}
		
		/** */
		private finalizeVerification()
		{
			this.faults.refresh();
			this.verificationQueue.clear();
			return this.faults.count === 0;
		}
		
		/**
		 * @internal
		 */
		queueVerification(target: Phrase)
		{
			// Avoid queueing the target phrase in the case one of the 
			// phrase's ancestors have already been queued.
			//
			// I'm pretty sure this is wrong ... you want this to go the
			// other way ... ie. you don't queue a phrase if there is
			// already a more deeply nested phrase in the queue,
			// and this can't really be determined quickly.
			//
			// TODO
			
			if (false)
				for (const targetPhraseAncestor of target.ancestry)
					if (this.verificationQueue.has(targetPhraseAncestor))
						return;
			
			this.verificationQueue.add(target);
		}
		
		/**
		 * @internal
		 * Removes the specified Phrase from the verification queue.
		 * 
		 * @returns A boolean value indicating whether the phrase
		 * was in the verification queue before being removed.
		 */
		cancelVerification(target: Phrase)
		{
			return this.verificationQueue.delete(target);
		}
		
		/**
		 * Stores an unsorted set of Phrases associated with any document
		 * in the program that have been queued for verification.
		 */
		private readonly verificationQueue = new Set<Phrase>();
		
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
