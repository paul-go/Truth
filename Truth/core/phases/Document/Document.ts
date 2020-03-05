
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
	export class Document extends AbstractClass
	{
		/**
		 * @internal
		 * Internal constructor for Document objects.
		 * Document objects are created via a Program object.
		 */
		static async new(
			program: Program,
			fromUri: KnownUri,
			source: string | SourceObject,
			saveFn: (doc: Document) => void): Promise<Document | Error>
		{
			const doc = new Document(program, fromUri);
			const uriStatements: UriStatement[] = [];
			const topLevelStatements: Statement[] = [];
			let maxIndent = Number.MAX_SAFE_INTEGER;
			
			const iterator = (() =>
			{
				if (fromUri.extension === Extension.truth)
					if (typeof source === "string")
						return Statement.readFromSource(doc, source);
				
				if (fromUri.extension === Extension.script)
					if (typeof source === "object")
						return Statement.readFromScript(doc, source);
				
				throw Exception.unknownState();
			})();
			
			for (const statement of iterator)
			{
				doc.statements.push(statement);
				
				if (statement.uri)
				{
					uriStatements.push(statement as UriStatement);
				}
				else if (statement.indent <= maxIndent && !statement.isNoop)
				{
					topLevelStatements.push(statement);
					maxIndent = statement.indent;
				}
			}
			
			// Calling this function saves the document in the Program instance
			// that invoked this new Document. This is a bit spagetti-ish, but the
			// newly created document has to be in the Program's .documents
			// array, or the updating of references won't work.
			saveFn(doc);
			
			if (uriStatements.length > 0)
				await doc.updateReferences([], uriStatements);

			Phrase.inflateRecursive(topLevelStatements);
			
			if ("DEBUG")
				Debug.printPhrases(doc, true, true);
			
			return doc;
		}
		
		/** */
		private constructor(program: Program, sourceUri: KnownUri)
		{
			super();
			this.program = program;
			this._uri = sourceUri;
			this.phrase = Phrase.new(this);
		}
		
		/** @internal */
		readonly class = Class.document;
		
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
		 * @internal
		 * A rolling version stamp that increments after each edit transaction.
		 */
		get version()
		{
			return this._version;
		}
		private _version = VersionStamp.next();
		
		/**
		 * Stores the complete list of the Document's statements,
		 * sorted in the order that they appear in the file.
		 */
		private readonly statements = new Array1Based<Statement>();
		
		/** A reference to the instance of the Compiler that owns this Document. */
		readonly program: Program;
		
		/**
		 * Queries this document for the root-level types.
		 * 
		 * @param uri The URI of the document to query. If the URI contains
		 * a type path, it is factored into the search.
		 * 
		 * @param typePath The type path within the document to search.
		 * 
		 * @returns A fully constructed Type instance that corresponds to
		 * the type at the URI specified, or null in the case when no type
		 * could be found.
		 */
		query(...typePath: string[])
		{
			return this.program.query(this, ...typePath);
		}
		
		/**
		 * Gets the root-level types that are defined within this document.
		 */
		get types()
		{
			if (this._types)
				return this._types;
			
			return this._types = Object.freeze(this.program.queryAll(this));
		}
		private _types: readonly Type[] | null = null;
		
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
		getAncestry(statement: Statement | number)
		{
			const smt = this.toStatement(statement);
			
			// If the statement is root-level, it can't have an ancestry.
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
			
			// If the statement is root-level, it can't have a parent.
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
			// input statement is top-level, and a reference
			// to this Document object is returned.
			return this;
		}
		
		/**
		 * @returns The Statement that would act as the parent if a statement where to be
		 * inserted at the specified virtual position in the document. If an inserted statement
		 * would be top-level, a reference to this document object is returned.
		 */
		getParentFromPosition(lineNumber: number, lineOffset: number): Statement | this
		{
			if (lineNumber === 1 || 
				lineNumber === 0 ||
				lineOffset < 1 || 
				this.statements.length === 0)
				return this;
			
			for (const smt of this.statements.enumerateBackward(lineNumber))
				if (!smt.isNoop && smt.indent < lineOffset)
					return smt;
			
			return this;
		}
		
		/**
		 * @returns The sibling Statement objects of the  specified Statement. 
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
		 * document's top-level statements are returned. 
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
		getNotes(statement: Statement | number)
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
		 */
		read(lineNumber: number)
		{
			return this.statements.get(lineNumber);
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
		async edit(editFn: (mutator: IDocumentMutator) => void)
		{
			if (this.isScripted)
				throw Exception.scriptsAreImmutable();
			
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
		async editAtomic(edits: IDocumentEdit[])
		{
			if (this.isScripted)
				throw Exception.scriptsAreImmutable();
			
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
			if (this.isScripted)
				throw Exception.scriptsAreImmutable();
			
			const deletedUriSmts: UriStatement[] = [];
			const addedUriSmts: UriStatement[] = [];
			const hasInsert = edits.some(ed => ed instanceof InsertEdit);
			const hasDelete = edits.some(ed => ed instanceof DeleteEdit);
			const hasUpdate = edits.some(ed => ed instanceof UpdateEdit);
			const hasMixed =
				hasInsert && hasUpdate ||
				hasInsert && hasDelete ||
				hasUpdate && hasDelete;
			
			const doDelete = (edit: DeleteEdit) =>
			{
				const smts = this.statements.splice(edit.pos, edit.count);
				for (const smt of smts)
				{
					smt.dispose();
					
					if (smt.uri)
						deletedUriSmts.push(smt as UriStatement);
				}
				
				return smts;
			};
			
			const doInsert = (edit: InsertEdit) =>
			{
				this.statements.splice(edit.pos, 0, edit.smt);
				
				if (edit.smt.uri)
					addedUriSmts.push(edit.smt as UriStatement);
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
			};
			
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
					
					//Debug.printDocument(this);
					//Debug.printPhrases(this, true, true);
				}
				
				this._types = null;
				this._version = VersionStamp.next();
				
				if (addedUriSmts.length + deletedUriSmts.length > 0)
					await this.updateReferences(deletedUriSmts, addedUriSmts);
			};
			
			if (!hasMixed)
			{
				// This handles the first optimization, which is the case where
				// the only kinds of mutations where updates, and no structural
				// changes occured. This handles typical "user is typing" cases.
				// Most edits will be caught here.
				if (hasUpdate)
				{
					// Sort the update edits by their index, and prune updates
					// that would be overridden in a following edit.
					const updateEditsTyped = edits as UpdateEdit[];
					const updateEdits = updateEditsTyped
						.sort((a, b) => a.pos - b.pos)
						.filter((ed, i) => i >= edits.length - 1 || ed.pos !== edits[i + 1].pos);
					
					const oldStatements = updateEdits.map(ed => this.read(ed.pos));
					const newStatements = updateEdits.map(ed => ed.smt);
					
					// Stores whether the indents of all updated statements are the
					// same, and that there wasn't been any statements change from
					// being a no-op to not.
					const noStructuralChanges = oldStatements.every((oldSmt, idx) =>
					{
						const newSmt = newStatements[idx];
						return oldSmt.indent === newSmt.indent ||
							oldSmt.isNoop && newSmt.isNoop;
					});
					
					if (noStructuralChanges)
					{
						const hasOpStatements =
							oldStatements.some(smt => !smt.isNoop) ||
							newStatements.some(smt => !smt.isNoop);
						
						return {
							deletePhrases()
							{
								if (hasOpStatements)
									Phrase.deflateRecursive(oldStatements);
							},
							updateDocument()
							{
								for (const updateEdit of updateEdits)
									doUpdate(updateEdit);
							},
							createPhrases()
							{
								if (hasOpStatements)
									Phrase.inflateRecursive(newStatements);
							},
							finalize
						};
					}
				}
				
				// This handles the second optimization, which is the case where
				// only deletes occured, and none of the deleted statements have any
				// descendants. This will handle the majority of "delete a line" cases.
				if (hasDelete)
				{
					const deleteEdits = edits as DeleteEdit[];
					const deadStatements: Statement[] = [];
					const deadIndexes: number[] = [];
					let hasOpStatements = false;
					
					forEdits:
					for (const deleteEdit of deleteEdits)
					{
						for (let i = -1; ++i < deleteEdit.count;)
						{
							const deadSmt = this.read(deleteEdit.pos + i);
							if (this.hasDescendants(deadSmt))
							{
								deadStatements.length = 0;
								break forEdits;
							}
							
							deadStatements.push(deadSmt);
							deadIndexes.push(i);
							
							if (!deadSmt.isNoop)
								hasOpStatements = true;
						}
					}
					
					if (deadStatements.length > 0)
					{
						return {
							deletePhrases()
							{
								// Tell subscribers to blow away all the old statements.
								// An edit transaction can be avoided completely in the case
								// when the only statements that were deleted were noops.
								if (hasOpStatements)
									Phrase.deflateRecursive(deadStatements);
							},
							updateDocument()
							{
								// Run the actual mutations
								deleteEdits.forEach(doDelete);
							},
							createPhrases() {},
							finalize
						}
					}
				}
			
				// This handles the third optimization, which is the case
				// where there are only noop statements being inserted
				// into the document.
				if (hasInsert)
				{
					const insertEdits = edits as InsertEdit[];
					if (insertEdits.every(ed => ed.smt.isNoop))
					{
						insertEdits.forEach(doInsert);
						return null;
					}
				}
			}
			
			// At this point, the checks to see if we can get away with
			// performing simplistic updates have failed. So we need
			// to resort to invalidating and revalidating larger swaths 
			// of statements.
			
			// Stores an array of statements whose descendant statements
			// should be invalidated. 
			const invalidatedParents = new Map<number, Statement>();
			
			// Stores a value indicating whether the entire document
			// needs to be invalidated.
			let mustInvalidateDoc = false;
			
			// The first step is to go through all the statements, and compute the 
			// set of parent statements from where invalidation should originate.
			// In the majority of cases, this will only be one single statement object.
			for (const ed of edits)
			{
				if (ed instanceof DeleteEdit)
				{
					const deletedStatement = this.read(ed.pos);
					if (deletedStatement.isNoop)
						continue;
					
					const parent = this.getParent(ed.pos);
					
					if (parent instanceof Statement)
					{
						invalidatedParents.set(ed.pos, parent);
					}
					else if (parent instanceof Document)
					{
						mustInvalidateDoc = true;
						break;
					}
					else throw Exception.unknownState();
				}
				else
				{
					if (ed instanceof InsertEdit)
					{
						if (ed.smt.isNoop)
							continue;
					}
					else if (ed instanceof UpdateEdit)
					{
						const oldStatement = this.read(ed.pos);
						if (oldStatement.isNoop && ed.smt.isNoop)
							continue;
					}
					
					const parent = this.getParentFromPosition(
						ed.pos,
						ed.smt.indent);
					
					if (parent instanceof Statement)
					{
						invalidatedParents.set(ed.pos, parent);
					}
					else if (parent === this)
					{
						mustInvalidateDoc = true;
						break;
					}
				}
			}
			
			// Although unclear how this could happen, if there
			// are no invalidated parents, we can safely return.
			if (!mustInvalidateDoc && invalidatedParents.size === 0)
				return null;
			
			// Prune any redundant parents. A parent is redundant
			// when it's a descendant of another parent in the 
			// invalidation array. The algorithm below compares the
			// statement ancestries of each possible pairs of invalidated
			// parents, and splices invalidated parents out of the 
			// array in the case when the parent is parented by some
			// other invalidated parent in the invalidatedParents array.
			const invalidatedAncestries: Statement[][] = [];
			
			for (const line of invalidatedParents.keys())
			{
				const ancestry = this.getAncestry(line);
				if (ancestry)
					invalidatedAncestries.push(ancestry);
			}
			
			if (invalidatedAncestries.length > 1)
			{
				for (let i = invalidatedAncestries.length; i--;)
				{
					const ancestryA = invalidatedAncestries[i];
					
					for (let n = i; n--;)
					{
						const ancestryB = invalidatedAncestries[n];
						
						if (ancestryA.length === ancestryB.length)
							continue;
						
						const aLessB = ancestryA.length < ancestryB.length;
						const ancestryShort = aLessB ? ancestryA : ancestryB;
						const ancestryLong = aLessB ? ancestryB : ancestryA;
						
						if (ancestryShort.every((smt, idx) => smt === ancestryLong[idx]))
							invalidatedAncestries.splice(aLessB ? n : i, 1);
					}
				}
			}
			
			const self = this;
			
			return {
				deletePhrases()
				{
					Phrase.deflateRecursive(mustInvalidateDoc ?
						Array.from(invalidatedParents.values()) :
						self.getChildren());
				},
				updateDocument()
				{
					const deletedStatements: Statement[] = [];
					
					// Perform the document mutations.
					for (const ed of edits)
					{
						if (ed instanceof DeleteEdit)
							deletedStatements.push(...doDelete(ed));
						
						else if (ed instanceof InsertEdit)
							doInsert(ed);
						
						else if (ed instanceof UpdateEdit)
							doUpdate(ed);
					}
					
					// Remove any deleted statements from the invalidatedParents map
					for (const deletedStatement of deletedStatements)
						for (const [at, parentStatement] of invalidatedParents)
							if (deletedStatement === parentStatement)
								invalidatedParents.delete(at);
				},
				createPhrases()
				{
					Phrase.inflateRecursive(Array.from(invalidatedParents.values()));
				},
				finalize
			};
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
				
				rawRefsToAdd.push(new Reference(smt, refDoc));
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
		 * Performs a depth-first traversal on this Document's dependency structure.
		 * The traversal pattern avoids following infinite loops due to circular dependencies.
		 */
		*traverseDependencies(): IterableIterator<Document>
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
				
				for (const dependency of doc._dependencies)
					yield *recurse(dependency);
			};
			
			for (const dependency of this._dependencies)
				yield *recurse(dependency);
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
