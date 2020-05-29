
namespace Truth
{
	/**
	 * A class that manages a single Truth document loaded as part of
	 * a Program.
	 * 
	 * Truth documents may be loaded from files, or they may be loaded
	 * from a string of Truth content directly (see the associated methods
	 * in Truth.Program).
	 */
	export class Document
	{
		/**
		 * @internal
		 * Internal constructor for Document objects.
		 * Document objects are created via a Program object.
		 */
		static async new(
			program: Program,
			fromUri: KnownUri,
			source: InputSource,
			saveFn: (doc: Document) => void): Promise<Document | Error>
		{
			const doc = new Document(program, fromUri);
			const uriStatements: UriStatement[] = [];
			const surfaceStatements: Statement[] = [];
			let maxIndent = Number.MAX_SAFE_INTEGER;
			
			const generator = (() =>
			{
				if (fromUri.extension === Extension.truth)
				{
					if (typeof source === "string")
						return Statement.readFromSource(doc, source);
					
					if (Misc.isIterable(source))
						return source as Iterable<string>;
				}
				else if (fromUri.extension === Extension.script)
				{
					if (typeof source !== "string" && !Misc.isIterable(source))
						return Statement.readFromScript(doc, source as SourceObject);
				}
				
				throw Exception.unknownState();
			})();
			
			for (const statement of generator)
			{
				const smt = typeof statement === "string" ?
					Statement.new(doc, statement) :
					statement;
				
				doc.statements.push(smt);
				
				if (smt.uri)
				{
					uriStatements.push(smt as UriStatement);
				}
				else if (smt.indent <= maxIndent && !smt.isNoop)
				{
					surfaceStatements.push(smt);
					maxIndent = smt.indent;
				}
			}
			
			// Calling this function saves the document in the Program instance
			// that invoked this new Document. This is a bit spagetti-ish, but the
			// newly created document has to be in the Program's .documents
			// array, or the updating of references won't work.
			saveFn(doc);
			
			if (uriStatements.length > 0)
				await doc.updateReferences([], uriStatements);

			Phrase.inflateRecursive(surfaceStatements);
			
			// if ("DEBUG")
			//	Debug.printPhrases(doc, true, true);
			
			return doc;
		}
		
		/**
		 * @internal
		 * Internal constructor for volatile Document objects.
		 * Volatile document objects are those that are not stored
		 * in this library's internal memory, but rather are returned
		 * back to the library consumer and forgotten.
		 */
		static newVolatile(
			program: Program,
			sourceText: string,
			dependencies: readonly Document[])
		{
			const doc = new Document(program, KnownUri.volatile);
			const generator = Statement.readFromSource(doc, sourceText);
			const surfaceStatements: Statement[] = [];
			let maxIndent = Number.MAX_SAFE_INTEGER;
			
			for (const statement of generator)
			{
				doc.statements.push(statement);
				
				if (statement.indent <= maxIndent && !statement.isNoop)
				{
					surfaceStatements.push(statement);
					maxIndent = statement.indent;
				}
			}
			
			doc._dependencies.push(...dependencies);
			Phrase.inflateRecursive(surfaceStatements);
			return doc;
		}
		
		/**
		 * @internal
		 * Internal constructor to create the trait class document.
		 * All trait classes defined within a program are all defined
		 * within a single Document, which is created by this method.
		 */
		static newTraitClassDocument(
			program: Program,
			classes: readonly Class[])
		{
			const doc = new Document(program, KnownUri.class);
			const surfaceStatements: Statement[] = [];
			let maxIndent = Number.MAX_SAFE_INTEGER;
			
			for (const smt of Statement.readFromClasses(doc, classes))
			{
				doc.statements.push(smt);
				
				if (smt.indent <= maxIndent)
				{
					surfaceStatements.push(smt);
					maxIndent = smt.indent;
				}
			}
			
			Phrase.inflateRecursive(surfaceStatements);
			return doc;
		}
		
		/** */
		private constructor(program: Program, sourceUri: KnownUri)
		{
			this.program = program;
			this._uri = sourceUri;
			this.phrase = Phrase.new(this);
		}
		
		/** @internal */
		readonly id = id();
		
		/**
		 * @internal
		 * Stores the root phrase associated with this document
		 * (with an empty terms array).
		 */
		readonly phrase: Phrase;
		
		/**
		 * Gets the URI from where this document was loaded.
		 */
		get uri(): KnownUri
		{
			return this._uri;
		}
		private _uri: KnownUri;
		
		/**
		 * Gets whether this document was generated from a script.
		 */
		get isScripted()
		{
			return this._uri.extension === Extension.script;
		}
		
		/**
		 * Gets whether this document is a volatile document.
		 */
		get isVolatile()
		{
			return this._uri === KnownUri.volatile;
		}
		
		/**
		 * Gets whether this document has unchecked information
		 * and is in need of a correctness check.
		 */
		get isUnchecked()
		{
			return this.program.isUnchecked(this);
		}
		
		/**
		 * @internal
		 * A rolling version stamp that increments after each edit transaction.
		 */
		get version(): ReadonlyVersion
		{
			return this._version;
		}
		private _version = Version.next();
		
		/**
		 * Stores the complete list of the Document's statements,
		 * sorted in the order that they appear in the file.
		 */
		private readonly statements = new Array1Based<Statement>();
		
		/** A reference to the instance of the Compiler that owns this Document. */
		readonly program: Program;
		
		/**
		 * Queries this document for the type that exists within it,
		 * at the specified type path.
		 * 
		 * @param typePath The type path to search.
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
		query(...typePath: string[])
		{
			return this.program.queryDocument(this, ...typePath);
		}
		
		/**
		 * Returns an iterator that iterates through all surface types
		 * defined within this document.
		 */
		eachType(): IterableIterator<Type>
		{
			if (this.isUnchecked)
				this.program.check(this);
			
			return this.program.getSurfaceTypes(this);
		}
		
		/**
		 * @returns A boolean value that indicates whether this document has a
		 * statement-level fault matching the fault type specified, on the specified line.
		 */
		hasFault(
			faultType: StatementFaultType,
			line: number): boolean;
		/**
		 * @returns A boolean value that indicates whether this document has a
		 * term-level fault matching the fault type specified, on the specified line,
		 * and at the specified term index.
		 */
		hasFault(
			faultType: SpanFaultType,
			line: number,
			termIndex: number): boolean;
		/** */
		hasFault(faultType: Readonly<FaultType>, line: number, termIndex = -1)
		{
			const comp = termIndex < 0 ?
				[faultType, line] :
				[faultType, line, termIndex];
			
			const compFault = this.createComparisonFault(comp as TComparisonFault);
			
			for (const fault of this.program.faults.each(this))
				if (this.program.faults.compareFaults(compFault, fault) === 0)
					return true;
			
			return false;
		}
		
		/**
		 * @returns A boolean value that indicates whether the document
		 * has at least one fault.
		 */
		hasFaults(): boolean;
		/**
		 * @returns A boolean value that indicates whether the document
		 * has exactly the faults specified (no more, no less).
		 */
		hasFaults(...expectations: TComparisonFault[]): boolean
		/** */
		hasFaults(...expectations: TComparisonFault[])
		{
			const faultsReported = Array.from(this.program.faults.each(this));
			
			if (expectations.length === 0)
				return faultsReported.length > 0;
			
			if (expectations.length !== faultsReported.length)
				return false;
			
			const faultsExpected = expectations
				.map(exp => this.createComparisonFault(exp))
				.sort(this.program.faults.compareFaults);
			
			for (let i = -1; ++i < faultsReported.length;)
			{
				const rep = faultsReported[i];
				const exp = faultsExpected[i];
				
				if (this.program.faults.compareFaults(rep, exp) !== 0)
					return false;
			}
			
			return true;
		}
		
		/** */
		private createComparisonFault(comp: TComparisonFault)
		{
			const smt = this.read(comp[1]);
			
			if (comp.length === 2)
				return new Fault(comp[0], smt);
			
			const nfxLen = smt.infixSpans.length;
			const idx = comp[2];
			const span = 
				nfxLen > 0 && idx === 0 ? smt.spans[0] :
				nfxLen > 0 && idx < nfxLen + 1 ? smt.infixSpans[idx - 1] :
				smt.spans[idx - nfxLen];
			
			return new Fault(comp[0], span);
		}
		
		/**
		 * @returns An array of Statement objects that represent
		 * ancestry of the specified statement, or 1-based line number. 
		 * If the specified statement is not in this document, the
		 * returned value is null.
		 */
		getAncestry(statement: Statement | number): readonly Statement[] | null
		{
			const smt = this.toStatement(statement);
			
			// If the statement is surface-level, it can't have an ancestry.
			if (smt.indent === 0)
				return [];
			
			let pos = this.statements.posOf(smt);
			
			if (pos < 0)
				return null;
			
			if (pos < 2)
				return [];
			
			const ancestry = [smt];
			let indentToBeat = smt.indent;
			
			for (const currentStatement of this.statements.enumerateBackward(pos))
			{
				if (currentStatement.isNoop)
					continue;
				
				if (currentStatement.indent < indentToBeat)
				{
					ancestry.unshift(currentStatement);
					indentToBeat = currentStatement.indent;
				}
				
				if (currentStatement.indent === 0)
					break;
			}
			
			return ancestry.slice(0, -1);
		}
		
		/**
		 * Gets the parent Statement object of the specified Statement. 
		 * If the statement is top level, a reference to this document object
		 * is returned. If the statement is not found in the document, or the
		 * specified statement is a no-op, the returned value is null.
		 * 
		 * @param statement A statement object, or a 1-based line number
		 * of a statement within this document.
		 */
		getParent(statement: Statement | number)
		{
			const smt = this.toStatement(statement);
			
			if (smt.isNoop)
				return null;
			
			// If the statement is surface-level, it can't have a parent.
			if (smt.indent === 0)
				return this;
			
			let pos = this.statements.posOf(smt);
			
			if (pos < 0)
				return null;
			
			// Simple optimization
			if (pos < 2)
				return this;
			
			const indentToBeat = smt.indent;
			
			for (const currentStatement of this.statements.enumerateBackward(pos))
			{
				if (currentStatement.isNoop)
					continue;
				
				if (currentStatement.indent < indentToBeat)
					return currentStatement;
			}
			
			// If a parent statement wasn't found, then the
			// input statement is surface-level, and a reference
			// to this Document object is returned.
			return this;
		}
		
		/**
		 * @returns The Statement that would act as the parent if a statement where to be
		 * inserted at the specified virtual position in the document. If an inserted statement
		 * would be surface-level, a reference to this document object is returned.
		 * 
		 * @param lineNumber The 1-based line number at which to begin.
		 * @param columnNumber The 1-based column number at which to begin.
		 */
		getParentFromPosition(lineNumber: number, columnNumber: number): Statement | this
		{
			if (lineNumber === 1 || 
				lineNumber === 0 ||
				columnNumber < 1 || 
				this.statements.length === 0)
				return this;
			
			for (const smt of this.statements.enumerateBackward(lineNumber))
				if (!smt.isNoop && smt.indent < columnNumber)
					return smt;
			
			return this;
		}
		
		/**
		 * @returns The sibling Statement objects of the specified Statement. 
		 * If the specified statement is a no-op, the returned value is null.
		 * @throws An error in the case when the statement is not found in 
		 * the document.
		 */
		getSiblings(statement: Statement | number)
		{
			const smt = this.toStatement(statement);
			
			if (smt.isNoop)
				return null;
			
			if (smt.indent === 0)
				return this.getChildren();
			
			const parent = this.getParent(smt);
			
			if (parent === null)
				return this.getChildren();
			
			if (parent === this)
				return parent.getChildren();
			
			return this.getChildren(parent as Statement);
		}
		
		/**
		 * @returns The child Statement objects of the specified
		 * Statement. If the argument is null or omitted, the
		 * document's surface-level statements are returned. 
		 * 
		 * @throws An error in the case when the specified
		 * statement is not found in the document. 
		 */
		getChildren(statement?: Statement)
		{
			const children: Statement[] = [];
			let pos = 1;
			
			// Stores the indent value that causes the loop
			// to terminate when reached.
			let stopIndent = -1;
			
			// Stores the indent value the indicates the maximum
			// value at which a statement is still considered to be
			// a child. This value can retract as the algorithm is
			// operating to deal with bizarre (but valid) indentation.
			let maxIndent = Number.MAX_SAFE_INTEGER;
			
			if (statement)
			{
				pos = this.statements.posOf(statement);
				if (pos < 0)
					throw Exception.statementNotInDocument();
				
				stopIndent = statement.indent;
				
				// Start the iteration 1 position after the statement
				// specified, so that we're always passing through
				// potential children.
				pos++;
			}
			
			for (const smt of this.statements.enumerateForward(pos))
			{
				if (smt.isNoop)
					continue;
				
				// Check if we need to back up the indentation of child statements, 
				// in order to deal with bizarre (but valid) indentation.
				if (smt.indent < maxIndent)
					maxIndent = smt.indent;
				
				if (smt.indent <= stopIndent)
					break;
				
				if (smt.indent <= maxIndent)
					children.push(smt);
			}
			
			return children;
		}
		
		/**
		 * @returns A boolean value that indicates whether the specified
		 * statement, or the statement at the specified index has any
		 * descendants. If the argument is null, the returned value is a
		 * boolean indicating whether this document has any non-noop
		 * statements.
		 */
		hasDescendants(statement: Statement | number | null)
		{
			if (statement === null)
			{
				for (const smt of this.statements.enumerateForward())
					if (!smt.isNoop)
						return true;
			}
			else
			{
				const smt = statement instanceof Statement ?
					statement : 
					this.statements.get(statement);
				
				if (smt.isNoop)
					return false;
				
				let idx = statement instanceof Statement ?
					this.statements.posOf(statement) :
					statement;
				
				for (const currentStatement of this.statements.enumerateForward(idx + 1))
				{
					if (currentStatement.isNoop)
						continue;
					
					return currentStatement.indent > smt.indent;
				}
			}
			
			return false;
		}
		
		/**
		 * @returns The 1-based line number of the specified statement in
		 * the document, relying on caching when available. If the statement
		 * does not exist in the document, the returned value is -1.
		 */
		lineNumberOf(statement: Statement)
		{
			return this.statements.posOf(statement);
		}
		
		/** 
		 * @returns An array of strings containing the content
		 * written in the comments directly above the specified
		 * statement. Whitespace lines are ignored. If the specified
		 * statement is a no-op, an empty array is returned.
		 */
		getNotes(statement: Statement | number): readonly string[]
		{
			const smt = this.toStatement(statement);
			if (smt.isNoop)
				return [];
			
			const lineNum = this.lineNumberOf(smt);
			if (lineNum < 1)
				return [];
			
			const commentLines: string[] = [];
			const requiredIndent = smt.indent;
			
			for (const currentStatement of this.statements.enumerateBackward(lineNum))
			{
				if (currentStatement.isWhitespace)
					continue;
				
				const commentText = currentStatement.getCommentText();
				if (commentText === null)
					break;
				
				if (currentStatement.indent !== requiredIndent)
					break;
				
				commentLines.push(commentText);
			}
				
			return commentLines;
		}
		
		/**
		 * Enumerates through each statement that is a descendant of the 
		 * specified statement. If the parameters are null or omitted, all 
		 * statements in this Document are yielded.
		 * 
		 * The method yields an object that contains the yielded statement,
		 * as well as a numeric level value that specifies the difference in 
		 * the number of nesting levels between the specified initialStatement
		 * and the yielded statement.
		 * 
		 * @param initialStatement A reference to the statement object
		 * from where the enumeration should begin.
		 * 
		 * @param includeInitial A boolean value indicating whether or
		 * not the specified initialStatement should also be returned
		 * as an element in the enumeration. If true, initialStatement
		 * must be non-null.
		 */
		*eachDescendant(
			initialStatement: Statement | undefined = undefined, 
			includeInitial?: boolean)
		{
			if (includeInitial)
			{
				if (!initialStatement)
					throw Exception.invalidArgument();
				
				yield { statement: initialStatement, level: 0 };
			}
			
			const initialChildren = this.getChildren(initialStatement);
			if (!initialChildren)
				return;
			
			const self = this;
			
			// The initial level is 0 if the specified initialStatement is
			// null, because it indicates that the enumeration starts
			// at the root of the document.
			let level = initialStatement ? 1 : 0;
			
			function *recurse(statement: Statement): IterableIterator<{
				statement: Statement;
				level: number;
			}>
			{
				yield { statement, level };
				
				level++;
				
				for (const childStatement of self.getChildren(statement) || [])
					yield *recurse(childStatement);
				
				level--;
			}
			
			for (const statement of initialChildren)
				yield *recurse(statement);
		}
		
		/**
		 * Enumerates through each statement in the document,
		 * including comments and whitespace-only lines, starting
		 * at the specified statement or numeric position.
		 * 
		 * @yields The statements in the order that they appear
		 * in the document, excluding whitespace-only statements.
		 */
		*eachStatement(statement?: Statement | number)
		{
			const startPos = (() =>
			{
				if (!statement)
					return 1;
				
				if (statement instanceof Statement)
					return this.statements.posOf(statement);
				
				return statement;
			})();
			
			for (const smt of this.statements.enumerateForward(startPos))
				yield smt;
		}
		
		/**
		 * Reads the Statement at the given 1-based line number.
		 * Negative numbers read Statement starting from the end of the document.
		 * 
		 * @throws An exception in the case when this document has no statements.
		 */
		read(lineNumber: number)
		{
			if (this.statements.length === 0)
				throw Exception.documentEmptyCannotRead();
			
			return this.statements.get(lineNumber);
		}
		
		/**
		 * Gets the number of statements in this document.
		 */
		get length()
		{
			return this.statements.length;
		}
		
		/**
		 * Convenience method that converts a statement or it's index
		 * within this document to a statement object.
		 */
		private toStatement(statementOrIndex: Statement | number)
		{
			return statementOrIndex instanceof Statement ? 
				statementOrIndex :
				this.read(statementOrIndex);
		}
		
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
		edit(editFn: (mutator: IDocumentMutator) => void)
		{
			if (this.isVolatile || this.isScripted)
				throw Exception.documentImmutable();
			
			return this.program.edit(programMutator =>
			{
				return editFn({
					insert: (text: string, at: number) => programMutator.insert(this, text, at),
					update: (text: string, at: number) => programMutator.update(this, text, at),
					delete: (at: number, count?: number) => programMutator.delete(this, at, count)
				});
			});
		}
		
		/**
		 * Executes a complete edit transaction, that may affect any
		 * document loaded into this program.
		 */
		editAtomic(edits: IDocumentEdit[])
		{
			if (this.isVolatile || this.isScripted)
				throw Exception.documentImmutable();
			
			const programEdits = edits.map(ed => ({
				document: this,
				range: ed.range,
				text: ed.text
			}));
			
			return this.program.editAtomic(programEdits);
		}
		
		/**
		 * @internal
		 * Computes a mutation task to be carried out in order for this document
		 * to be edited, potentially in tandem with other documents.
		 */
		createMutationTask(edits: TEdit[]): IDocumentMutationTask | null
		{
			if (this.isVolatile || this.isScripted)
				throw Exception.documentImmutable();
			
			const self = this;
			const deletedUriSmts: UriStatement[] = [];
			const addedUriSmts: UriStatement[] = [];
			const insertEdits = edits.filter((e): e is InsertEdit => e instanceof InsertEdit);
			const updateEdits = edits.filter((e): e is UpdateEdit => e instanceof UpdateEdit);
			const deleteEdits = edits.filter((e): e is DeleteEdit => e instanceof DeleteEdit);
			const hasInsert = insertEdits.length > 0;
			const hasDelete = deleteEdits.length > 0;
			const hasUpdate = updateEdits.length > 0;
			
			if (hasUpdate && (hasDelete || hasInsert))
				throw Exception.invalidEditSequence();
			
			if (hasDelete && hasInsert && edits.some((v, i, a) => 
				i > 0 &&
				a[i - 1] instanceof InsertEdit && 
				a[i] instanceof DeleteEdit))
				throw Exception.invalidEditSequence();
			
			const hasChangeHandlers = this.program.hasHandlers("statementChange");
			const changeInfos: IStatementChangeInfo[] = [];
			
			const doDelete = (edit: DeleteEdit) =>
			{
				const smts = this.statements.splice(edit.pos, edit.count);
				if (smts.length)
				{
					for (const smt of smts)
					{
						smt.dispose();
						
						if (smt.uri)
							deletedUriSmts.push(smt as UriStatement);
						
						if (hasChangeHandlers)
							changeInfos.push({ kind: "delete", statement: smt });
					}
				}
			};
			
			const doInsert = (edit: InsertEdit) =>
			{
				this.statements.splice(edit.pos, 0, edit.smt);
				
				if (edit.smt.uri)
					addedUriSmts.push(edit.smt as UriStatement);
				
				if (hasChangeHandlers)
					changeInfos.push({ kind: "insert", statement: edit.smt });
			};
			
			const doUpdate = (edit: UpdateEdit) =>
			{
				const existing = this.read(edit.pos);
				if (existing.uri)
					deletedUriSmts.push(existing as UriStatement);
				
				this.statements.set(edit.pos, edit.smt);
				if (edit.smt.uri)
					addedUriSmts.push(edit.smt as UriStatement);
				
				existing.dispose();
				
				if (hasChangeHandlers)
					changeInfos.push({
						kind: "update",
						statement: existing,
						replacement: edit.smt
					});
			};
			
			const doTriggerHandlers = () =>
			{
				if (hasChangeHandlers)
					this.program.emit("statementChange", this, changeInfos);
			};
			
			const statementsOf = (deleteEdit: DeleteEdit) =>
				this.statements.slice(deleteEdit.pos, deleteEdit.pos + deleteEdit.count);
			
			optimizeSilent: for (;;)
			{
				// First optimization is to process the changes, and then quit without
				// notifying the rest of the system in the case when the only thing
				// that changed about the document was no-op statements.
				for (const edit of edits)
				{
					if (edit instanceof DeleteEdit)
					{
						if (statementsOf(edit).some(smt => !smt.isNoop))
							break optimizeSilent;
					}
					else if (edit instanceof InsertEdit)
					{
						if (!edit.smt.isNoop)
							break optimizeSilent;
					}
					else
					{
						const original = this.read(edit.pos);
						
						if (!original.isNoop || !edit.smt.isNoop)
							break optimizeSilent;
					}
				}
				
				const that = this;
				
				// If we've gotten to this point, it means that the changes can
				// be processed without notifying the rest of the system.
				return {
					deletePhrases() {},
					updateDocument()
					{
						for (const edit of edits)
						{
							if (edit instanceof UpdateEdit)
								doUpdate(edit);
							
							else if (edit instanceof InsertEdit)
							{
								for (let line = that.statements.length; line >= edit.pos; line--)
									that.read(line).moveBy(1);
								
								doInsert(edit);
							}
							else if (edit instanceof DeleteEdit)
							{
								for (let line = that.statements.length; line >= edit.pos + edit.count; line--)
									that.read(line).moveBy(-edit.count);
								
								doDelete(edit);
							}
						}
					},
					createPhrases() {},
					finalize: async () => doTriggerHandlers()
				};
			}
			
			const finalize = async () =>
			{
				// Perform a debug-time check to be sure that there are
				// no disposed statements left hanging around in the document
				// after the edit transaction has completed.
				if ("DEBUG")
				{
					for (const smt of this.statements.enumerateForward())
						if (smt.isDisposed)
							throw Exception.unknownState();
					
					//console.clear();
					//Debug.printDocument(this);
					//Debug.printPhrases(this, true, true);
				}
				
				this._version.bump();
				
				if (addedUriSmts.length + deletedUriSmts.length > 0)
					await this.updateReferences(deletedUriSmts, addedUriSmts);
				
				this.program.uncheckDocument(this);
				doTriggerHandlers();
			};
			
			// This is an optimization that catches the case when there are only
			// UpdateEdits, and all statements being updated have the same indent,
			// the no-op status isn't changing. This will catch the majority of "the user
			// is typing" cases. It will even catch cases where the user has multiple
			// cursors and is updating many statements at once.
			for (;;)
			{
				if (insertEdits.length > 0 || deleteEdits.length > 0)
					break;
				
				const originals = updateEdits.map(ed => this.read(ed.pos));
				const updates = updateEdits.map(ed => ed.smt);
				const indentO = originals[0].indent;
				const indentU = updates[0].indent;
				if (indentO !== indentU)
					break;
				
				if (!originals.every(smt => smt.indent === indentO))
					break;
				
				if (!updates.every(smt => smt.indent === indentU))
					break;
				
				if (!originals.every((v, i) => updates[i].isNoop === v.isNoop))
					break;
				
				return {
					deletePhrases()
					{
						const deflate = originals.filter(smt => !smt.isNoop);
						Phrase.deflateRecursive(deflate);
					},
					updateDocument()
					{
						for (const edit of updateEdits)
							doUpdate(edit);
					},
					createPhrases()
					{
						const inflate = updateEdits
							.map(ed => ed.smt)
							.filter(smt => !smt.isNoop);
						
						Phrase.inflateRecursive(inflate);
					},
					finalize
				};
			}
			
			// Optimization to deal with populating an empty document
			if (this.statements.length === 0)
			{
				return {
					deletePhrases() { },
					updateDocument()
					{
						for (const edit of insertEdits)
							doInsert(edit);
					},
					createPhrases()
					{
						for (const statement of self.getChildren())
							Phrase.inflateRecursive([statement]);
					},
					finalize
				}
			}
			
			// At this point, it is guaranteed that the set of edits are either
			// all of the same type (inserts, updates, deletes) or a sequence 
			// of deletes followed by a sequence of inserts.
			
			const max = 2 ** 32;
			const len = this.statements.length;
			const deleteCount = deleteEdits.reduce((total, e) => e.count + total, 0);
			const insertCount = insertEdits.length;
			const statementCountDelta = insertCount - deleteCount;
			
			let minIndent = max;
			let minPos = max;
			let maxPos = 0;
			
			if (updateEdits.length > 0)
			{
				minPos = updateEdits
					.reduce((pos, ed) => Math.min(pos, ed.pos), max);
				
				maxPos = updateEdits
					.reduce((pos, ed) => Math.max(pos, ed.pos), -1);
					
				minIndent = updateEdits
					.reduce((indent, ed) => Math.min(ed.smt.indent, indent), max); 
			}
			else
			{
				for (const edit of edits)
				{
					if (edit.pos < minPos)
						minPos = edit.pos;
					
					if (edit instanceof DeleteEdit)
					{
						if (edit.pos > maxPos)
							maxPos = edit.pos + (edit.count - 1);
						
						else if (edit.pos > minPos)
							maxPos += edit.count;
						
						for (const smt of statementsOf(edit))
							if (smt.indent < minIndent)
								minIndent = smt.indent;
					}
					else if (edit instanceof InsertEdit)
					{
						if (edit.pos > maxPos)
							maxPos = edit.pos;
						
						if (edit.smt.indent < minIndent)
							minIndent = edit.smt.indent;
					}
				}
			}
			
			const findOp = (pos: number, step: number) =>
			{
				for (;;)
				{
					pos += step;
					if (pos < 1 || pos > len)
						break;
					
					const smt = this.read(pos);
					if (!smt.isNoop)
						return smt;
				}
				
				return null;
			};
			
			if (minIndent > 0)
			{
				for (let pos = minPos; pos <= maxPos; pos++)
				{
					const nextIndent = this.read(pos).indent;
					if (nextIndent < minIndent)
						minIndent = nextIndent;
				}
			}
			
			const prevOp = findOp(minPos, -1);
			
			// If maxPos is less than 0, it means that there are inserts at the
			// end of the document, in which case, there cannot be a "next op"
			const nextOp = maxPos < 0 ? null : findOp(maxPos, 1);
			
			let minDeflateInflate = minPos;
			let maxDeflate = maxPos;
			
			// In the case when there is an op statement directly above
			// the upper-most affected statement, or directly below the
			// bottom-most affected statement whose indent is greater
			// than the min indent of the affected area, the invalidation
			// range needs to be expanded. This is necessary in order to
			// catch situations where deflation of the affected area or
			// inflation of new area could cause a split or merge in the
			// statement hierarchy.
			if ((prevOp && prevOp.indent > minIndent) || 
				(nextOp && nextOp.indent > minIndent))
			{
				for (let pos = minPos; --pos > 0;)
				{
					if (this.read(pos).indent <= minIndent)
					{
						minDeflateInflate = pos;
						break;
					}
				}
				
				for (let pos = maxPos; ++pos <= len;)
				{
					if (this.read(pos).indent <= minIndent || pos === len)
					{
						maxDeflate = pos;
						break;
					}
				}
			}
			
			const maxInflate = maxDeflate + statementCountDelta;
			
			const numDescendants = (from: number) =>
			{
				let count = 0;
				const smt = this.read(from);
				
				for (const smtChild of self.statements.enumerateForward(from + 1))
					if (smtChild.indent > smt.indent || smtChild.isNoop)
						count++;
					else
						break;
				
				return count;
			}
			
			return {
				deletePhrases()
				{
					const deflations: Statement[] = [];
					
					for (let pos = minDeflateInflate; pos <= maxDeflate; pos++)
					{
						const smt = self.read(pos);
						if (smt.indent === minIndent && !smt.isNoop)
							deflations.push(smt);
						
						pos += numDescendants(pos);
					}
					
					Phrase.deflateRecursive(deflations);
				},
				updateDocument()
				{
					for (const edit of deleteEdits)
						doDelete(edit);
						
					for (const edit of insertEdits)
						doInsert(edit);
					
					for (const edit of updateEdits)
						doUpdate(edit);
				},
				createPhrases()
				{
					const inflations: Statement[] = [];
					
					for (let pos = minDeflateInflate; pos <= maxInflate; pos++)
					{
						const smt = self.read(pos);
						if (smt.indent === minIndent && !smt.isNoop)
							inflations.push(smt);
						
						pos += numDescendants(pos);
					}
					
					Phrase.inflateRecursive(inflations);
				},
				finalize
			}
		}
		
		/**
		 * Updates the references that this document has to other documents.
		 */
		private async updateReferences(
			deleted: UriStatement[],
			added: UriStatement[])
		{
			// This algorithm always performs all deletes before adds.
			// For this reason, if a URI is both in the list of deleted URIs
			// as well as the list of added URIs, it means that the URI
			// started in the document, and is currently still there.
			
			const rawRefsExisting = this.referencesRaw.slice();
			const rawRefsToAdd: Reference[] = [];
			const rawRefsToDelete: Reference[] = [];
			
			// The faults that are generated are stored in an array,
			// so that they can all be reported at once at the end.
			// This is because this method is async, and it's important
			// that all the faults are reported in the same turn of
			// the event loop.
			const faults: StatementFault[] = [];
			
			// Delete old URI statements from the array.
			for (const del of deleted)
			{
				const idx = rawRefsExisting.findIndex(v => v.statement === del);
				if (idx > -1)
					rawRefsToDelete.push(rawRefsExisting.splice(idx, 1)[0]);
			}
			
			if ("DEBUG")
				if (deleted.length !== rawRefsToDelete.length)
					throw Exception.unknownState();
			
			// Populate addedReferences array. This loop blindly attempts to load
			// all referenced documents, regardless of whether there's going to be
			// some fault generated as a result of attempting to establish a reference
			// to the document.
			for await (const smt of added)
			{
				let refDoc: Document | Error | null = null;
				
				// Bail if a document loaded from HTTP is trying to reference
				// a document located on the file system.
				const isToFile = smt.uri.protocol === UriProtocol.file;
				const thisProto = this.uri.protocol;
				
				if (isToFile && (thisProto === UriProtocol.http || thisProto === UriProtocol.https))
				{
					faults.push(Faults.InsecureResourceReference.create(smt));
				}
				else
				{
					refDoc = this.program.getDocumentByUri(smt.uri);
					if (!refDoc)
						refDoc = await this.program.addDocumentFromUri(smt.uri);
				}
				
				// This is cheating a bit. It's unclear how this could result in an error
				// at this point, or what to do if it did.
				if (refDoc instanceof Error)
				{
					refDoc = null;
					faults.push(Faults.UnresolvedResource.create(smt));
				}
				else
				{
					rawRefsToAdd.push(new Reference(smt, refDoc));
				}
			}
			
			if ("DEBUG")
				if (added.length !== rawRefsToAdd.length)
					throw Exception.unknownState();
			
			const toReferenceTuples = (refs: Reference[]) =>
				refs.map(v => [this.lineNumberOf(v.statement), v] as [number, Reference]);
			
			const rawRefsProposed = [
				...toReferenceTuples(rawRefsExisting),
				...toReferenceTuples(rawRefsToAdd)
			]
				.sort(([numA], [numB]) => numB - numA)
				.map(([num, ref]) => ref);
			
			const realRefs: Reference[] = [];
			const rawRefDocuments = rawRefsProposed.map(v => v.target);
			
			for (const [idx, doc] of rawRefDocuments.entries())
			{
				if (!doc)
					continue;
				
				if (rawRefDocuments.indexOf(doc) !== idx)
				{
					const smt = rawRefsProposed[idx].statement;
					faults.push(Faults.DuplicateReference.create(smt));
				}
				else
				{
					realRefs.push(rawRefsProposed[idx]);
				}
			}
			
			const realRefsDeleted = this.referencesReal.filter(v => !realRefs.includes(v));
			const realRefsAdded = realRefs.filter(v => !this.referencesReal.includes(v));
			
			this.referencesRaw.length = 0;
			this.referencesRaw.push(...rawRefsProposed);
			this.referencesReal.length = 0;
			this.referencesReal.push(...realRefs);
			
			this._dependencies.length = 0;
			this._dependencies.push(...realRefs
				.map(v => v.target)
				.filter((v): v is Document => !!v));
			
			for (const ref of realRefsAdded)
			{
				const dependents = ref.target?._dependents;
				if (dependents && !dependents.includes(this))
					dependents.push(this);
			}
			
			for (const ref of realRefsDeleted)
			{
				const dependents = ref.target?._dependents;
				if (dependents)
					for (let i = dependents.length; i-- > 0;)
						if (dependents[i] === this)
							dependents.splice(i, 1);
			}
			
			let hasCircularFaults = false;
			
			for (const refDeleted of realRefsDeleted)
				if (this.program.cycleDetector.didDelete(refDeleted.statement))
					hasCircularFaults = true;
			
			for (const refAdded of realRefsAdded)
				if (this.program.cycleDetector.didAdd(refAdded.statement))
					hasCircularFaults = true;
			
			for (const fault of faults)
				this.program.faults.report(fault);
			
			if (faults.length || hasCircularFaults)
				this.program.faults.refresh();
			
			// TODO: Broadcast the added and removed dependencies to external
			// observers (outside the compiler). Make sure to broadcast only the
			// change in dependencies, not the change in references (which are different)
			// Implementing this will require a re-working of the cause system.
		}
		
		/**
		 * (Not implemented)
		 * 
		 * Updates this document's sourceUri with the new URI specified.
		 * The value specified may be a relative URI, in which case, the final
		 * URI will be made relative to this document.
		 * 
		 * @throws An error in the case when a document has been loaded
		 * into the Program that is already associated with the URI specified,
		 * or when the value specified could not be parsed.
		 */
		updateUri(newValue: string)
		{
			const newUri = KnownUri.fromString(newValue, this._uri);
			if (newUri === null)
				throw Exception.invalidUri(newValue);
			
			const existing = this.program.getDocumentByUri(newUri);
			if (existing)
				throw Exception.uriAlreadyExists();
			
			if (newUri.protocol !== this._uri.protocol)
				throw Exception.uriProtocolsMustMatch();
			
			const wasUri = this._uri;
			this._uri = newUri;
			
			for (const doc of this.program.documents)
				doc.didUpdateUri(this, wasUri);
		}
		
		/** */
		private didUpdateUri(affectedDoc: Document, was: KnownUri)
		{
			const newlyBrokenRaw: Reference[] = [];
			const newlyTargetedRaw: Reference[] = [];
			
			for (const ref of this.referencesRaw)
			{
				if (ref.statement.uri === was)
					newlyBrokenRaw.push(ref);
				
				else if (ref.statement.uri === affectedDoc._uri)
					newlyTargetedRaw.push(ref);
			}
			
			if (newlyBrokenRaw.length + newlyTargetedRaw.length === 0)
				return;
			
			throw Exception.notImplemented();
		}
		
		/**
		 * Stores the Reference objects that are having some impact 
		 * on this document's relationship structure. 
		 */
		private readonly referencesReal: Reference[] = [];
		
		/**
		 * Stores an array of Reference objects, where each item the array
		 * corresponds to a unique URI-containing Statement objects. 
		 * Statement objects may not actually be affecting the document's
		 * relationship structure, such as in the case when there are multiple
		 * statements within this document all referencing the same document, 
		 * (only one statement would be affecting in this case), or when the
		 * referenced document is unavailable for some reason.
		 */
		private readonly referencesRaw: Reference[] = [];
		
		/**
		 * Gets an array containing the other documents that this document has
		 * as a dependency.
		 * 
		 * Because circular document relationships are storable at the Document
		 * level, performing a deep traversal on these dependencies is considered an
		 * unsafe operation, due to the possibility of generating a stack overflow.
		 * 
		 * To perform a deep traversal on document dependencies, considering
		 * using the .traverseDependencies() method.
		 */
		get dependencies(): readonly Document[]
		{
			return this._dependencies;
		}
		private readonly _dependencies: Document[] = [];
		
		/**
		 * Gets an array containing the other documents that depend on this
		 * document.
		 * 
		 * Because circular document relationships are storable at the Document
		 * level, performing a deep traversal on these dependents is considered an
		 * unsafe operation, due to the possibility of generating a stack overflow.
		 */
		get dependents(): readonly Document[]
		{
			return this._dependents;
		}
		private readonly _dependents: Document[] = [];
		
		/** @internal */
		getStatementCausingDependency(dependency: Document)
		{
			for (const ref of this.referencesReal)
				if (ref.target === dependency)
					return ref.statement;
			
			return null;
		}
		
		/**
		 * Performs a depth-first traversal on the graph of Documents on which this
		 * document depends. The traversal pattern avoids following infinite loops
		 * due to circular dependencies.
		 */
		traverseDependencies(): IterableIterator<Document>
		{
			return this.traversePrivate(true);
		}
		
		/**
		 * Performs a depth-first traversal on the graph of Documents that depend
		 * on this document. The traversal pattern avoids following infinite loops
		 * due to circular dependencies.
		 */
		traverseDependents(): IterableIterator<Document>
		{
			return this.traversePrivate(false);
		}
		
		/** */
		private *traversePrivate(dependencies: boolean): IterableIterator<Document>
		{
			const self = this;
			const yielded: Document[] = [];
			
			function *recurse(doc: Document): IterableIterator<Document>
			{
				if (doc === self)
					return;
				
				if (!yielded.includes(doc))
				{
					yielded.push(doc);
					yield doc;
				}
				
				const docs = dependencies ? doc._dependencies : doc._dependents;
				for (const dependency of docs)
					yield *recurse(dependency);
			};
			
			const docs = dependencies ? this._dependencies : this._dependents;
			for (const dependency of docs)
				yield *recurse(dependency);
			
			// Yield the class container document in the case when it exists
			// at the very end. This will ensure that any terms it defines are 
			// resolved last.
			if (dependencies)
				if (this.program.traitClassDocument)
					yield this.program.traitClassDocument;
		}
		
		/**
		 * Returns a formatted version of the Document.
		 */
		toString(keepOriginalFormatting?: boolean, showLineNumbers?: boolean)
		{
			const lines: string[] = [];
			const maxDigits = (this.statements.length + 1).toString().length;
			const digitSuffix = " ".repeat(maxDigits);
			
			const add = (text: string) =>
				lines.push(showLineNumbers ? 
					(digitSuffix + (lines.length + 1).toString()).slice(maxDigits) + "|" + text :
					text);
			
			if (keepOriginalFormatting)
			{
				for (const statement of this.statements.enumerateForward())
					add(statement.sourceText);
			}
			else for (const { statement, level } of this.eachDescendant())
			{
				const indent = Syntax.tab.repeat(level);
				add(indent + statement.toString());
			}
			
			return lines.join("\n");
		}
	}
}
