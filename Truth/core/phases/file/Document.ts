
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
			sourceText: string,
			saveFn: (doc: Document) => void): Promise<Document | Error>
		{
			const doc = new Document(program, fromUri);
			const uriStatements: UriStatement[] = [];
			
			const topLevelStatements: Statement[] = [];
			const topLevelStatementIndexes: number[] = [];
			let maxIndent = Number.MAX_SAFE_INTEGER;
			let lineNumber = 0;
			
			for (const statementText of this.readLines(sourceText))
			{
				const smt = new Statement(doc, statementText)
				doc.statements.push(smt);
				
				if (smt.uri)
				{
					uriStatements.push(smt as UriStatement);
				}
				else if (smt.indent <= maxIndent && !smt.isNoop)
				{
					topLevelStatements.push(smt);
					topLevelStatementIndexes.push(++lineNumber);
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
			
			program.cause(new CauseRevalidate(
				doc,
				topLevelStatements,
				topLevelStatementIndexes
			));
			
			return doc;
		}
		
		/**
		 * Generator function that yields all statements (unparsed lines)
		 * of the given source text. 
		 */
		private static *readLines(source: string)
		{
			let cursor = -1;
			let statementStart = 0;
			const char = () => source[cursor];
			
			for (;;)
			{
				if (cursor >= source.length - 1)
					return yield source.slice(statementStart);
				
				cursor++;
				
				if (char() === Syntax.terminal)
				{
					yield source.slice(statementStart, cursor);
					statementStart = cursor + 1;
				}
			}
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
		 * Stores the URI from where this document was loaded.
		 */
		get uri(): KnownUri
		{
			return this._uri;
		}
		private _uri: KnownUri;
		
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
		private readonly statements: Statement[] = [];
		
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
		query(...typePath: string[]): Type | null
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
			
			return this._types = Object.freeze(this.program.query(this));
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
		 * ancestry of the specified statement. If the specified
		 * statement is not in this document, the returned value
		 * is null.
		 */
		getAncestry(statement: Statement | number)
		{
			const smt = this.toStatement(statement);
			
			// If the statement is root-level, it can't have an ancestry.
			if (smt.indent === 0)
				return [];
			
			let idx = this.getIndex(statement);
			
			if (idx < 0)
				return null;
			
			if (idx === 0)
				return [];
			
			const ancestry = [smt];
			let indentToBeat = smt.indent;
			
			do
			{
				const currentStatement = this.statements[idx];
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
			while (idx-- > 0);
			
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
			
			let idx = this.getIndex(statement);
			
			if (idx < 0)
				return null;
			
			if (idx === 0)
				return this;
			
			const indentToBeat = smt.indent;
			
			do
			{
				const currentStatement = this.statements[idx];
				if (currentStatement.isNoop)
					continue;
				
				if (currentStatement.indent < indentToBeat)
					return currentStatement;
			}
			while (idx-- > 0);
			
			// If a parent statement wasn't found, then the
			// input statement is top-level, and a reference
			// to this Document object is returned.
			return this;
		}
		
		/**
		 * @returns The Statement that would act as the parent  if a statement where to be
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
			
			for (let idx = this.getIndex(lineNumber) + 1; idx--;)
			{
				const currentStatement = this.statements[idx];
				if (!currentStatement.isNoop && currentStatement.indent < lineOffset)
					return currentStatement;
			}
			
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
			
			let idx = statement ?
				this.statements.indexOf(statement) :
				0;
			
			if (idx < 0)
				throw Exception.statementNotInDocument();
			
			// Stores the indent value that causes the loop
			// to terminate when reached.
			const minIndent = statement ? statement.indent : -1;
			let maxIndent = Number.MAX_SAFE_INTEGER;
			
			// Start the iteration 1 position after the statement
			// specified, so that we're always passing through
			// potential children.
			
			while (++idx < this.statements.length)
			{
				const smt = this.statements[idx];
				
				if (smt.isNoop)
					continue;
				
				// Check if we need to back up the indentation of child statements, 
				// in order to deal with bizarre (but valid) indentation.
				if (smt.indent < maxIndent)
					maxIndent = smt.indent;
				
				// If we've reached the end of a series of a
				// statement locality.
				if (smt.indent <= minIndent)
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
				for (let idx = -1; ++idx < this.statements.length;)
					if (!this.statements[idx].isNoop)
						return true;
			}
			else
			{
				const smt = statement instanceof Statement ?
					statement : 
					this.statements[statement];
				
				if (smt.isNoop)
					return false;
				
				let idx = statement instanceof Statement ?
					this.statements.indexOf(statement) :
					statement;
				
				while (++idx < this.statements.length)
				{
					const currentStatement = this.statements[idx];
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
		getLineNumber(statement: Statement)
		{
			const idx = this.statements.indexOf(statement);
			return idx < 0 ? -1 : idx + 1;
		}
		
		/**
		 * Returns the 0-based index of the specified statement in this
		 * document's array of statements.
		 */
		private getIndex(statement: Statement | number): number;
		/**
		 * Returns a 0-based index that corresponds to the specified line
		 * number. 
		 * 
		 * The number returned is upper-bounded by the length of
		 * the statements array, and lower-bounded by 1.
		 * 
		 * Negative line numbers refer to positions starting from the
		 * last statement in the document.
		 */
		private getIndex(lineNumber: Statement | number): number;
		private getIndex(param: Statement | number)
		{
			if (param instanceof Statement)
				return this.statements.indexOf(param);
			
			const len = this.statements.length;
			
			if (len === 0 || param === 0)
				return 0;
			
			if (param > 0)
				return Math.min(param, len) - 1;
			
			if (param < 0)
				return Math.max(len + param, 1);
			
			throw Exception.unknownState();
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
			
			const lineNum = this.getLineNumber(smt);
			if (lineNum < 1)
				return [];
			
			const commentLines: string[] = [];
			const requiredIndent = smt.indent;
			
			for (let num = lineNum; num--;)
			{
				const currentStatement = this.statements[num];
				
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
			const startIdx = (() =>
			{
				if (!statement)
					return 0;
				
				if (statement instanceof Statement)
					return this.statements.indexOf(statement);
				
				return statement;
			})();
			
			for (let i = startIdx; i < this.statements.length; i++)
				yield this.statements[i];
		}
		
		/**
		 * Reads the Statement at the given 1-based line number.
		 * Negative numbers read Statement starting from the end of the document.
		 */
		read(lineNumber: number)
		{
			const idx = this.getIndex(lineNumber);
			return this.statements[idx];
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
			if (this.inEdit)
				throw Exception.doubleTransaction();
			
			this.inEdit = true;
			const calls: TCallType[] = [];
			let hasDelete = false;
			let hasInsert = false;
			let hasUpdate = false;
			
			editFn({
				delete: (at = -1, count = 1) =>
				{
					if (count > 0)
					{
						const idx = this.getIndex(at);
						calls.push(new DeleteCall(idx, count));
						hasDelete = true;
					}
				},
				insert: (text: string, at = -1) =>
				{
					const len = this.statements.length;
					const idx = at > len ? len : this.getIndex(at);
					calls.push(new InsertCall(new Statement(this, text), idx));
					hasInsert = true;
				},
				update: (text: string, at = -1) =>
				{
					if (this.read(at).sourceText !== text)
					{
						const idx = this.getIndex(at);
						calls.push(new UpdateCall(new Statement(this, text), idx));
						hasUpdate = true;
					}
				}
			});
			
			if (calls.length === 0)
			{
				this.inEdit = false;
				return;
			}
			
			const deletedUriSmts: UriStatement[] = [];
			const addedUriSmts: UriStatement[] = [];
			
			// Begin the algorithm that determines the changeset,
			// and runs the appropriate invalidation and revalidation
			// hooks. This is wrapped in an IIFE because we need to
			// perform finalization at the bottom (and there are early
			// return points throughout the algorithm.
			(() =>
			{
				const hasMixed =
					hasInsert && hasUpdate ||
					hasInsert && hasDelete ||
					hasUpdate && hasDelete;
				
				const doDelete = (call: DeleteCall) =>
				{
					const smts = this.statements.splice(call.at, call.count);
					
					for (const smt of smts)
					{
						smt.dispose();
						
						if (smt.uri)
							deletedUriSmts.push(smt as UriStatement);
					}
					
					return smts;
				};
				
				const doInsert = (call: InsertCall) =>
				{
					if (call.at >= this.statements.length)
						this.statements.push(call.smt);
					else
						this.statements.splice(call.at, 0, call.smt);
					
					if (call.smt.uri)
						addedUriSmts.push(call.smt as UriStatement);
				};
				
				const doUpdate = (call: UpdateCall) =>
				{
					const existing = this.statements[call.at];
					if (existing.uri)
						deletedUriSmts.push(existing as UriStatement);
					
					this.statements[call.at] = call.smt;
					if (call.smt.uri)
						addedUriSmts.push(call.smt as UriStatement);
					
					existing.dispose();
				};
				
				if (!hasMixed)
				{
					// This handles the first optimization, which is the case where
					// the only kinds of mutations where updates, and no structural
					// changes occured. This handles typical "user is typing" cases.
					// Most edits will be caught here.
					if (hasUpdate)
					{
						// Sort the update calls by their index, and prune updates
						// that would be overridden in a following call.
						const updateCallsTyped = calls as UpdateCall[];
						const updateCalls = updateCallsTyped
							.sort((a, b) => a.at - b.at)
							.filter((call, i) => i >= calls.length - 1 || call.at !== calls[i + 1].at);
						
						const oldStatements = updateCalls.map(c => this.statements[c.at]);
						const newStatements = updateCalls.map(c => c.smt);
						const indexes = Object.freeze(updateCalls.map(c => c.at));
						
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
							
							if (hasOpStatements)
							{
								// Tell subscribers to blow away all the old statements.
								this.program.cause(new CauseInvalidate(
									this,
									oldStatements,
									indexes));
							}
							
							// Run the actual mutations
							for (const updateCall of updateCalls)
								doUpdate(updateCall);
							
							if (hasOpStatements)
							{
								// Tell subscribers what changed
								this.program.cause(new CauseRevalidate(
									this, 
									newStatements,
									indexes));
							}
							
							return;
						}
					}
				
					// This handles the second optimization, which is the case where
					// only deletes occured, and none of the deleted statements have any
					// descendants. This will handle the majority of "delete a line" cases.
					if (hasDelete)
					{
						const deleteCalls = calls as DeleteCall[];
						const deadStatements: Statement[] = [];
						const deadIndexes: number[] = [];
						let hasOpStatements = false;
						
						forCalls:
						for (const deleteCall of deleteCalls)
						{
							for (let i = -1; ++i < deleteCall.count;)
							{
								const deadSmt = this.statements[deleteCall.at + i];
								if (this.hasDescendants(deadSmt))
								{
									deadStatements.length = 0;
									break forCalls;
								}
								
								deadStatements.push(deadSmt);
								deadIndexes.push(i);
								
								if (!deadSmt.isNoop)
									hasOpStatements = true;
							}
						}
						
						if (deadStatements.length > 0)
						{
							// Tell subscribers to blow away all the old statements.
							// An edit transaction can be avoided completely in the case
							// when the only statements that were deleted were noops.
							if (hasOpStatements)
								this.program.cause(new CauseInvalidate(
									this,
									deadStatements,
									deadIndexes));
							
							// Run the actual mutations
							deleteCalls.forEach(doDelete);
							
							// Run an empty revalidation hook, to comply with the
							// rule that for every invalidation hook, there is always a
							// corresponding revalidation hook.
							if (hasOpStatements)
								this.program.cause(new CauseRevalidate(this, [], []));
							
							return;
						}
					}
					
					// This handles the third optimization, which is the case
					// where there are only noop statements being inserted
					// into the document.
					if (hasInsert)
					{
						const insertCalls = calls as InsertCall[];
						if (insertCalls.every(call => call.smt.isNoop))
						{
							insertCalls.forEach(doInsert);
							return;
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
				for (const call of calls)
				{
					if (call instanceof DeleteCall)
					{
						const deletedStatement = this.statements[call.at];
						if (deletedStatement.isNoop)
							continue;
						
						const parent = this.getParent(call.at);
						
						if (parent instanceof Statement)
						{
							invalidatedParents.set(call.at, parent);
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
						if (call instanceof InsertCall)
						{
							if (call.smt.isNoop)
								continue;
						}
						else if (call instanceof UpdateCall)
						{
							const oldStatement = this.statements[call.at];
							
							if (oldStatement.isNoop && call.smt.isNoop)
								continue;
						}
						
						const parent = this.getParentFromPosition(
							call.at,
							call.smt.indent);
						
						if (parent instanceof Statement)
						{
							invalidatedParents.set(call.at, parent);
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
					return;
				
				// Prune any redundant parents. A parent is redundant
				// when it's a descendant of another parent in the 
				// invalidation array. The algorithm below compares the
				// statement ancestries of each possible pairs of invalidated
				// parents, and splices invalidated parents out of the 
				// array in the case when the parent is parented by some
				// other invalidated parent in the invalidatedParents array.
				const invalidatedAncestries: Statement[][] = [];
				
				for (const at of invalidatedParents.keys())
				{
					const ancestry = this.getAncestry(at);
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
				
				const parents = mustInvalidateDoc ? [] : Array.from(invalidatedParents.values());
				const indexes = mustInvalidateDoc ? [] : Array.from(invalidatedParents.keys());
				
				// Notify observers of the Invalidate hook to invalidate the
				// descendants of the specified set of parent statements.
				this.program.cause(new CauseInvalidate(this, parents, indexes));
				
				
				const deletedStatements: Statement[] = [];
				
				// Perform the document mutations.
				for (const call of calls)
				{
					if (call instanceof DeleteCall)
						deletedStatements.push(...doDelete(call));
					
					else if (call instanceof InsertCall)
						doInsert(call);
					
					else if (call instanceof UpdateCall)
						doUpdate(call);
				}
				
				// Remove any deleted statements from the invalidatedParents map
				for (const deletedStatement of deletedStatements)
					for (const [at, parentStatement] of invalidatedParents)
						if (deletedStatement === parentStatement)
							invalidatedParents.delete(at);
				
				// Notify observers of the Revalidate hook to update the
				// descendants of the specified set of parent statements.
				this.program.cause(new CauseRevalidate(
					this, 
					Array.from(invalidatedParents.values()),
					Array.from(invalidatedParents.keys())
				));				
			})();
			
			// Perform a debug-time check to be sure that there are
			// no disposed statements left hanging around in the document
			// after the edit transaction has completed.
			if ("DEBUG")
				for (const smt of this.statements)
					if (smt.isDisposed)
						throw Exception.unknownState();
			
			// Clean out any type cache
			this._types = null;
			
			// Tell subscribers that the edit transaction completed.
			this.program.cause(new CauseEditComplete(this));
			
			this._version = VersionStamp.next();
			this.inEdit = false;
			
			if (addedUriSmts.length + deletedUriSmts.length > 0)
				await this.updateReferences(deletedUriSmts, addedUriSmts);
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
		async editAtomic(edits: IDocumentEdit[])
		{
			return this.edit(statements =>
			{
				for (const editInfo of edits)
				{
					if (!editInfo.range)
						throw new TypeError("No range included.");
					
					const startLine = editInfo.range.startLineNumber;
					const endLine = editInfo.range.endLineNumber;
					
					const startChar = editInfo.range.startColumn;
					const endChar = editInfo.range.endColumn;
					
					const startLineText = this.read(startLine).sourceText;
					const endLineText = this.read(endLine).sourceText;
					
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
								prefixSegment + editInfo.text + suffixSegment, 
								startLine);
						}
						else 
						{
							statements.update(prefixSegment + segments[0], startLine);
							
							for (let i = startLine; i <= endLine; i++)
							{
								statements.update(
									prefixSegment + segments[i] + suffixSegment,
									startLine);
							}
							
							statements.update(segments.slice(-1)[0] + suffixSegment, endLine);
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
								statements.delete(startLine + 1, deleteCount);
								continue;
							}
						
						// Detect a delete ranging from the start of
						// one line to the start of a successive line
						if (startChar + endChar === 0)
						{
							statements.delete(startLine, deleteCount);
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
								statements.insert(segments[i], startLine + i);
							
							continue;
						}
						
						// Cursor is at the beginning of the line, and the
						// last line of the inserted content is empty.
						if (startChar === 0 && segments.slice(-1)[0] === "")
						{
							for (let i = -1; ++i < segments.length - 1;)
								statements.insert(segments[i], startLine + i);
							
							continue;
						}
					}
					
					// This is the "fallback" behavior -- simply delete everything
					// that is old, and insert everything that is new.
					const deleteCount = endLine - startLine + 1;
					statements.delete(startLine, deleteCount);
					
					const insertLines = segments.slice();
					insertLines[0] = prefixSegment + insertLines[0];
					insertLines[insertLines.length - 1] += suffixSegment;
					
					for (let i = -1; ++i < insertLines.length;)
						statements.insert(insertLines[i], startLine + i);
				}
			});
		}
		
		/**
		 * A state variable that stores whether an
		 * edit transaction is currently underway.
		 */
		private inEdit = false;
		
		/**
		 * 
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
				refs.map(v => [this.getLineNumber(v.statement), v] as [number, Reference]);
			
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
			
			function* recurse(doc: Document): IterableIterator<Document>
			{
				if (doc === self)
					return;
				
				if (!yielded.includes(doc))
				{
					yielded.push(doc);
					yield doc;
				}
				
				for (const dependency of doc._dependencies)
					yield* recurse(dependency);
			};
			
			for (const dependency of this._dependencies)
				yield* recurse(dependency);
		}
		
		/**
		 * Returns a formatted version of the Document.
		 */
		toString(keepOriginalFormatting?: boolean)
		{
			const lines: string[] = [];
			
			if (keepOriginalFormatting)
			{
				for (const statement of this.statements)
					lines.push(statement.sourceText);
			}
			else for (const { statement, level } of this.eachDescendant())
			{
				const indent = Syntax.tab.repeat(level);
				lines.push(indent + statement.toString());
			}
			
			return lines.join("\n");
		}
	}
}
