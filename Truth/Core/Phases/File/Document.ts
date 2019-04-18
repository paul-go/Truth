import * as X from "../../X";

/**
 * 
 */
export class Document
{
	/**
	 * @internal
	 * Internal constructor for Document objects.
	 * Document objects are created via a Program
	 * object.
	 */
	constructor(program: X.Program, sourceUri: X.Uri, sourceText: string)
	{
		if (sourceUri.types.length)
			throw X.Exception.invalidArgument();
		
		this.program = program;
		this._sourceUri = sourceUri;
		
		if (this.inEdit)
			throw X.Exception.doubleTransaction();
		
		this.statements.length = 0;
		
		for (const statementText of readLines(sourceText))
			this.statements.push(new X.Statement(this, statementText));
		
		program.on(X.CauseDocumentUriChange, data =>
		{
			if (data.document === this)
			{
				if (this.inEdit)
					throw X.Exception.invalidWhileInEditTransaction();
					
				this._sourceUri = data.newUri;
			}
		});
	}
	
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
	query(...typePath: string[]): X.Type | null
	{
		return this.program.query(this, ...typePath);
	}
	
	/**
	 * @returns An array of Statement objects that represent
	 * ancestry of the specified statement. If the specified
	 * statement is not in this document, the returned value
	 * is null.
	 */
	getAncestry(statement: X.Statement | number)
	{
		const smt = this.toStatement(statement);
		
		// If the statement is root-level, it can't have an ancestry.
		if (smt.indent === 0)
			return [];
		
		const startingIndex = this.toLineNumber(statement);
		
		if (startingIndex < 0)
			return null;
		
		if (startingIndex === 0)
			return [];
		
		const ancestry = [smt];
		let indentToBeat = smt.indent;
		
		for (let idx = startingIndex; --idx > -1;)
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
		
		return ancestry.slice(0, -1);
	}
	
	/**
	 * @returns The parent Statement object of the specified
	 * Statement. If the statement is top level, a reference to
	 * this document object is returned. If the statement is
	 * not found in the document, or the specified statement
	 * is a no-op, the returned value is null.
	 */
	getParent(statement: X.Statement | number)
	{
		const smt = this.toStatement(statement);
		
		if (smt.isNoop)
			return null;
		
		// If the statement is root-level, it can't have a parent.
		if (smt.indent === 0)
			return this;
		
		const startingIndex = this.toLineNumber(statement);
		
		if (startingIndex < 0)
			return null;
		
		if (startingIndex === 0)
			return this;
		
		const currentIndent = smt.indent;
		
		for (let idx = startingIndex; --idx > -1;)
		{
			const currentStatement = this.statements[idx];
			if (currentStatement.isNoop)
				continue;
			
			if (currentStatement.indent < currentIndent)
				return currentStatement;
		}
		
		// If a parent statement wasn't found, then the
		// input statement is top-level, and a reference
		// to this Document object is returned.
		return this;
	}
	
	/**
	 * @returns The Statement that would act as the parent 
	 * if a statement where to be inserted at the specified
	 * virtual position in the document. If an inserted
	 * statement would be top-level, a reference to this 
	 * document object is returned.
	 */
	getParentFromPosition(virtualLine: number, virtualOffset: number): X.Statement | this
	{
		if (virtualLine === 0 || virtualOffset < 1 || this.statements.length === 0)
			return this;
		
		const line = applyBounds(virtualLine, this.statements.length);
		
		for (let idx = line; idx--;)
		{
			const currentStatement = this.statements[idx];
			if (!currentStatement.isNoop && currentStatement.indent < virtualOffset)
				return currentStatement;
		}
		
		return this;
	}
	
	/**
	 * @returns The sibling Statement objects of the 
	 * specified Statement. If the specified statement
	 * is not found in the document, or is a no-op, the
	 * returned value is null.
	 */
	getSiblings(statement: X.Statement | number)
	{
		const smt = this.toStatement(statement);
		
		if (smt.isNoop)
			return null;
		
		if (smt.indent === 0)
			return this.getChildren(null);
		
		const parent = this.getParent(smt);
		
		if (parent === null)
			return null;
		
		if (parent === this)
			return parent.getChildren(null);
		
		return this.getChildren(<X.Statement>parent);
	}
	
	/**
	 * @returns The child Statement objects of the specified
	 * Statement. If the argument is null or omitted, the document's
	 * top-level statements are returned. If the specified statement 
	 * is not found in the document, the returned value is null.
	 */
	getChildren(statement: X.Statement | null = null)
	{
		const children: X.Statement[] = [];
		
		// Stores the indent value that causes the loop
		// to terminate when reached.
		const breakIndent = statement ? statement.indent : -1;
		let childIndent = Number.MAX_SAFE_INTEGER;
		
		const startIdx = statement ? 
			this.getLineNumber(statement) :
			-1;
			
		if (startIdx >= this.statements.length)
			return [];
		
		for (let idx = startIdx; ++idx < this.statements.length;)
		{
			const currentStatement = this.statements[idx];
			
			if (currentStatement.isNoop)
				continue;
			
			// Check if we need to back up the indentation
			// of child statements, in order to deal with bizarre
			// (but unfortunately, valid) indentation.
			if (currentStatement.indent < childIndent)
				childIndent = currentStatement.indent;
			
			// If we've reached the end of a series of a
			// statement locality.
			if (currentStatement.indent <= breakIndent)
				break;
			
			if (currentStatement.indent <= childIndent)
				children.push(currentStatement);
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
	hasDescendants(statement: X.Statement | number | null)
	{
		if (statement === null)
		{
			for (let idx = -1; ++idx < this.statements.length;)
				if (!this.statements[idx].isNoop)
					return true;
		}
		else
		{
			const smt = statement instanceof X.Statement ?
				statement : 
				this.statements[statement];
			
			if (smt.isNoop)
				return false;
			
			let idx = statement instanceof X.Statement ?
				this.getLineNumber(statement) :
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
	 * @returns The index of the specified statement in
	 * the document, relying on caching when available.
	 * If the statement does not exist in the document,
	 * the returned value is -1.
	 */
	getLineNumber(statement: X.Statement)
	{
		return this.statements.indexOf(statement);
	}
	
	/** 
	 * @returns An array of strings containing the content
	 * written in the comments directly above the specified
	 * statement. Whitespace lines are ignored. If the specified
	 * statement is a no-op, an empty array is returned.
	 */
	getNotes(statement: X.Statement | number)
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
		initialStatement: X.Statement | null = null, 
		includeInitial?: boolean)
	{
		if (includeInitial)
		{
			if (!initialStatement)
				throw X.Exception.invalidArgument();
			
			yield { statement: initialStatement, level: 0 };
		}
		
		const initialChildren = this.getChildren(initialStatement);
		const self = this;
		
		// The initial level is 0 if the specified initialStatement is
		// null, because it indicates that the enumeration starts
		// at the root of the document.
		let level = initialStatement ? 1 : 0;
		
		function *recurse(statement: X.Statement): IterableIterator<{
			statement: X.Statement;
			level: number;
		}>
		{
			yield { statement, level };
			
			level++;
			
			for (const childStatement of self.getChildren(statement))
				yield *recurse(childStatement);
			
			level--;
		}
		
		for (const statement of initialChildren)
			yield *recurse(statement);
	}
	
	/**
	 * @deprecated
	 * Enumerates through each unique URI defined in this document,
	 * that are referenced within the descendants of the specified
	 * statement. If the parameters are null or omitted, all unique
	 * URIs referenced in this document are yielded.
	 * 
	 * @param initialStatement A reference to the statement object
	 * from where the enumeration should begin.
	 * 
	 * @param includeInitial A boolean value indicating whether or
	 * not the specified initialStatement should also be returned
	 * as an element in the enumeration. If true, initialStatement
	 * must be non-null.
	 */
	*eachUri(
		initialStatement: X.Statement | null = null,
		includeInitial?: boolean)
	{
		//
		// NOTE: Although this method is deprecated, if it were
		// to be revived, it would need to support "cruft".
		//
		
		const yieldedUris = new Set<string>();
		const iter = this.eachDescendant(initialStatement, includeInitial);
		
		for (const descendant of iter)
		{
			for (const span of descendant.statement.declarations)
			{
				for (const spine of span.factor())
				{
					const uri = X.Uri.clone(spine);
					const uriText = uri.toString();
					
					if (!yieldedUris.has(uriText))
					{
						yieldedUris.add(uriText);
						yield { uri, uriText };
					}
				}
			}
		}
	}
	
	/**
	 * Enumerates through each statement in the document,
	 * including comments and whitespace-only lines, starting
	 * at the specified statement or numeric position.
	 * 
	 * @yields The statements in the order that they appear
	 * in the document, excluding whitespace-only statements.
	 */
	*eachStatement(statement?: X.Statement | number)
	{
		const startNum = (() =>
		{
			if (!statement)
				return 0;
			
			if (statement instanceof X.Statement)
				return this.getLineNumber(statement);
			
			return statement;
		})();
		
		for (let i = startNum - 1; ++i < this.statements.length;)
			yield this.statements[i];
	}
	
	/**
	 * Reads the Statement at the given position.
	 * Negative numbers read Statement starting from the end of the document.
	 */
	read(lineNumber: number)
	{
		const lineBounded = applyBounds(lineNumber, this.statements.length);
		return this.statements[lineBounded];
	}
	
	/**
	 * Convenience method that converts a statement or it's index
	 * within this document to a statement object.
	 */
	private toStatement(statementOrIndex: X.Statement | number)
	{
		return statementOrIndex instanceof X.Statement ? 
			statementOrIndex :
			this.read(statementOrIndex);
	}
	
	/**
	 * Convenience method to quickly turn a value that may be
	 * a statement or a statement index, into a bounded statement 
	 * index.
	 */
	private toLineNumber(statementOrIndex: X.Statement | number)
	{
		return statementOrIndex instanceof X.Statement ?
			this.getLineNumber(statementOrIndex) :
			applyBounds(statementOrIndex, this.statements.length);
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
	 */
	edit(editFn: (mutator: IDocumentMutator) => void)
	{
		if (this.inEdit)
			throw X.Exception.doubleTransaction();
		
		class InsertCall { constructor(readonly smt: X.Statement, readonly at: number) { } }
		class UpdateCall { constructor(readonly smt: X.Statement, readonly at: number) { } }
		class DeleteCall { constructor(readonly at: number, readonly count: number) { } }
		type TCallType = InsertCall | UpdateCall | DeleteCall;
		const calls: TCallType[] = [];
		
		let hasDelete = false;
		let hasInsert = false;
		let hasUpdate = false;
		
		this.inEdit = true;
		
		editFn({
			delete: (at = -1, count = 1) =>
			{
				if (count > 0)
				{
					calls.push(new DeleteCall(at, count));
					hasDelete = true;
				}
			},
			insert: (text: string, at = -1) =>
			{
				calls.push(new InsertCall(new X.Statement(this, text), at));
				hasInsert = true;
			},
			update: (text: string, at = -1) =>
			{
				const boundAt = applyBounds(at, this.statements.length);
				if (this.read(boundAt).sourceText !== text)
				{
					calls.push(new UpdateCall(new X.Statement(this, text), at));
					hasUpdate = true;
				}
			}
		});
		
		if (calls.length === 0)
		{
			this.inEdit = false;
			return;
		}
		
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
			
			const boundAt = (call: TCallType) =>
				applyBounds(call.at, this.statements.length);
			
			const doDelete = (call: DeleteCall) =>
			{
				const at = boundAt(call);
				const smts = this.statements.splice(at, call.count);
				
				for (const smt of smts)
					smt.dispose();
				
				return smts;
			};
			
			const doInsert = (call: InsertCall) =>
			{
				if (call.at >= this.statements.length)
				{
					this.statements.push(call.smt);
				}
				else
				{
					const at = boundAt(call);
					this.statements.splice(at, 0, call.smt);
				}
			};
			
			const doUpdate = (call: UpdateCall) =>
			{
				const at = boundAt(call);
				this.statements[at].dispose();
				this.statements[at] = call.smt;
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
					//! Remove this unnecessary variable once we can do that
					//! without ESLint complaining (unnecessary brackets).
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
							this.program.cause(new X.CauseInvalidate(
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
							this.program.cause(new X.CauseRevalidate(
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
					const deleteCalls = <DeleteCall[]>calls;
					const deadStatements: X.Statement[] = [];
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
							this.program.cause(new X.CauseInvalidate(
								this,
								deadStatements,
								deadIndexes));
						
						// Run the actual mutations
						deleteCalls.forEach(doDelete);
						
						// Run an empty revalidation hook, to comply with the
						// rule that for every invalidation hook, there is always a
						// corresponding revalidation hook.
						if (hasOpStatements)
							this.program.cause(new X.CauseRevalidate(this, [], []));
						
						return;
					}
				}
				
				// This handles the third optimization, which is the case
				// where there are only noop statements being inserted
				// into the document.
				if (hasInsert)
				{
					const insertCalls = <InsertCall[]>calls;
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
			//const invalidatedParents: { at: number; parent: X.Statement; }[] = [];
			const invalidatedParents = new Map<number, X.Statement>();
			
			// Stores a value indicating whether the entire document
			// needs to be invalidated.
			let mustInvalidateDoc = false;
			
			// The first step is to go through all the statements, and compute the 
			// set of parent statements from where invalidation should originate.
			// In the majority of cases, this will only be one single statement object.
			for (const call of calls)
			{
				const atBounded = applyBounds(call.at, this.statements.length);
				
				if (call instanceof DeleteCall)
				{
					const deletedStatement = this.statements[atBounded];
					if (deletedStatement.isNoop)
						continue;
					
					const parent = this.getParent(atBounded);
					
					if (parent instanceof X.Statement)
					{
						invalidatedParents.set(call.at, parent);
					}
					else if (parent instanceof X.Document)
					{
						mustInvalidateDoc = true;
						break;
					}
					else throw X.Exception.unknownState();
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
						const oldStatement = this.statements[atBounded];
						
						if (oldStatement.isNoop && call.smt.isNoop)
							continue;
					}
					
					const parent = this.getParentFromPosition(
						call.at,
						call.smt.indent);
					
					if (parent instanceof X.Statement)
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
			const invalidatedAncestries: X.Statement[][] = [];
			
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
			this.program.cause(new X.CauseInvalidate(this, parents, indexes));
			
			const deletedStatements: X.Statement[] = [];
			
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
			this.program.cause(new X.CauseRevalidate(
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
					throw X.Exception.unknownState();
		
		// Tell subscribers that the edit transaction completed.
		this.program.cause(new X.CauseEditComplete(this));
		
		this._version = X.VersionStamp.next();
		this.inEdit = false;
	}
	
	/**
	 * Executes a complete edit transaction, applying the series
	 * of edits specified in the `edits` parameter. 
	 */
	editAtomic(edits: IDocumentEdit[])
	{
		this.edit(statements =>
		{
			for (const editInfo of edits)
			{
				if (!editInfo.range)
					throw new TypeError("No range included.");
				
				const startLine = editInfo.range.startLineNumber - 1;
				const endLine = editInfo.range.endLineNumber - 1;
				
				const startChar = editInfo.range.startColumn - 1;
				const endChar = editInfo.range.endColumn - 1;
				
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
	
	/** Stores the URI from where this document was loaded. */
	get sourceUri()
	{
		return this._sourceUri;
	}
	private _sourceUri: X.Uri;
	
	/** A reference to the instance of the Compiler that owns this Document. */
	readonly program: X.Program;
	
	/**
	 * Stores the complete list of the Document's statements,
	 * sorted in the order that they appear in the file.
	 */
	private readonly statements: X.Statement[] = [];
	
	/**
	 * A state variable that stores whether an
	 * edit transaction is currently underway.
	 */
	private inEdit = false;
	
	/**
	 * @internal
	 * A rolling version stamp that increments after each edit transaction.
	 */
	get version()
	{
		return this._version;
	}
	private _version = X.VersionStamp.next();
	
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
			const indent = X.Syntax.tab.repeat(level);
			lines.push(indent + statement.toString());
		}
		
		return lines.join("\n");
	}
}


/**
 * Represents an interface for creating a
 * batch of document mutation operations.
 */
interface IDocumentMutator
{
	/**
	 * Inserts a fact at the given position, and returns the inserted Fact. 
	 * Negative numbers insert facts starting from the end of the document.
	 * The factText argument is expected to be one single complete line of text.
	 */
	insert(text: string, at: number): void;
	
	/**
	 * Replaces a fact at the given position, and returns the replaced Fact. 
	 * Negative numbers insert facts starting from the end of the document.
	 * The factText argument is expected to be one single complete line of text.
	 */
	update(factText: string, at: number): void;
	
	/** 
	 * Deletes a fact at the given position, and returns the deleted Fact. 
	 * Negative numbers delete facts starting from the end of the document.
	 */
	delete(at: number, count?: number): void;
}


/**
 * 
 */
interface IDocumentEdit
{
	/**
	 * Stores a range in the document that represents the
	 * content that should be replaced.
	 */
	readonly range: IDocumentEditRange;
	
	/**
	 * Stores the new text to be inserted into the document.
	 */
	readonly text: string;
}


/**
 * An interface that represents a text range within the loaded document.
 * This interface is explicitly designed to be compatible with the Monaco
 * text editor API (and maybe others) to simplify integrations.
 */
export interface IDocumentEditRange
{
	/**
	 * Stores the line number on which the range starts (starts at 0).
	 */
	readonly startLineNumber: number;
	
	/**
	 * Stores the column on which the range starts in line
	 * `startLineNumber` (starts at 0).
	 */
	readonly startColumn: number;
	
	/**
	 * Stores the line number on which the range ends.
	 */
	readonly endLineNumber: number;
	
	/**
	 * Stores the Column on which the range ends in line
	 * `endLineNumber`.
	 */
	readonly endColumn: number;
}


/**
 * Generator function that yields all statements (unparsed lines)
 * of the given source text. 
 */
function *readLines(source: string)
{
	let cursor = -1;
	let statementStart = 0;
	const char = () => source[cursor];
	
	for (;;)
	{
		if (cursor >= source.length - 1)
			return yield source.slice(statementStart);
		
		cursor++;
		
		if (char() === X.Syntax.terminal)
		{
			yield source.slice(statementStart, cursor);
			statementStart = cursor + 1;
		}
	}
}


/**
 * Performs the integer bounding and wrapping formula that is
 * common on all positional arguments found in JavaScript array
 * and string methods (such as Array.slice).
 */
function applyBounds(index: number, length: number)
{
	if (index === 0 || length === 0)
		return 0;
	
	if (index > 0)
		return Math.min(index, length - 1);
	
	if (index < 0)
		return Math.max(length + index, 0);
	
	throw X.Exception.unknownState();
}
