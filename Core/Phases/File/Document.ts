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
		if (sourceUri.typePath.length)
			throw X.Exception.invalidArgument();
		
		this.program = program;
		this.sourceUri = sourceUri;
		
		this.fill(sourceText);
	}
	
	/**
	 * Fills the document with the specified source code.
	 * If the document is non-empty, it is emptied before being filled.
	 * @param source The source text to fill the document.
	 */
	private fill(sourceText: string)
	{
		if (this.inEdit)
			throw X.Exception.doubleTransaction();
		
		this.statements.length = 0;
		
		for (const statementText of readLines(sourceText))
		{
			const statement = new X.Statement(this, statementText);
			this.statements.push(statement);
			
			if (statement.isNoop)
				continue;
		}
	}
	
	/**
	 * @returns An array of Statement objects that represent
	 * ancestry of the specified statement. If the specified
	 * statement is not in this document, the returned value
	 * is null.
	 */
	getAncestry(statement: X.Statement | number)
	{
		const stmt = this.toStatement(statement);
		
		// If the statement is root-level, it can't have an ancestry.
		if (stmt.indent === 0)
			return [];
		
		const startingIndex = this.toIndex(statement);
		
		if (startingIndex < 0)
			return null;
		
		if (startingIndex === 0)
			return [];
		
		const ancestry = [stmt];
		let indentToBeat = stmt.indent;
		
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
		const stmt = this.toStatement(statement);
		
		if (stmt.isNoop)
			return null;
		
		// If the statement is root-level, it can't have a parent.
		if (stmt.indent === 0)
			return this;
		
		const startingIndex = this.toIndex(statement);
		
		if (startingIndex < 0)
			return null;
		
		if (startingIndex === 0)
			return this;
		
		let currentIndent = stmt.indent;
		
		for (let idx = startingIndex; --idx > -1;)
		{
			const currentStatement = this.statements[idx];
			if (currentStatement.isNoop)
				continue;
			
			if (currentStatement.indent < currentIndent)
			{
				this.statementIndexCache.set(currentStatement, idx);
				return currentStatement;
			}
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
			{
				this.statementIndexCache.set(currentStatement, idx);
				return currentStatement;
			}
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
		const stmt = this.toStatement(statement);
		
		if (stmt.isNoop)
			return null;
		
		if (stmt.indent === 0)
			return this.getChildren(null);
		
		const parent = this.getParent(stmt);
		
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
		
		let startIdx = statement ? 
			this.getStatementIndex(statement) :
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
			const stmt = statement instanceof X.Statement ?
				statement : 
				this.statements[statement];
			
			if (stmt.isNoop)
				return false;
			
			let idx = statement instanceof X.Statement ?
				this.getStatementIndex(statement) :
				statement;
			
			while (++idx < this.statements.length)
			{
				const currentStatement = this.statements[idx];
				if (currentStatement.isNoop)
					continue;
				
				return currentStatement.indent > stmt.indent;
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
	getStatementIndex(statement: X.Statement)
	{
		const idx = this.statementIndexCache.get(statement);
		if (idx !== undefined)
			return idx;
		
		for (let i = 0; i < this.statements.length; i++)
		{
			if (this.statements[i] === statement)
			{
				this.statementIndexCache.set(statement, i);
				return i;
			}
		}
		
		return -1;
	}
	
	/** 
	 * @returns An array of strings containing the content
	 * written in the comments directly above the specified
	 * statement. Whitespace lines are ignored. If the specified
	 * statement is a no-op, an empty array is returned.
	 */
	getNotes(statement: X.Statement | number)
	{
		const stmt = this.toStatement(statement);
		if (stmt.isNoop)
			return [];
		
		const stmtIdx = this.getStatementIndex(stmt);
		if (stmtIdx < 1)
			return [];
		
		const commentLines: string[] = [];
		const requiredIndent = stmt.indent;
		
		for (let idx = stmtIdx; idx--;)
		{
			const currentStatement = this.statements[idx];
			
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
			
			yield { statement: initialStatement, level : 0 };
		}
		
		const initialChildren = this.getChildren(initialStatement);
		const self = this;
		
		// The initial level is 0 if the specified initialStatement is
		// null, because it indicates that the enumeration starts
		// at the root of the document.
		let level = initialStatement ? 1 : 0;
		
		function *recurse(statement: X.Statement): IterableIterator<{
			statement: X.Statement,
			level: number
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
		const yieldedUris = new Set<string>();
		const iter = this.eachDescendant(initialStatement, includeInitial);
		
		for (const descendant of iter)
		{
			for (const span of descendant.statement.declarations)
			{
				for (const spine of span.factor())
				{
					const uri = X.Uri.create(spine);
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
	 * starting at the specified statement, or numeric position.
	 * 
	 * @yields The statements in the order that they appear
	 * in the document, excluding whitespace-only statements.
	 */
	*eachStatement(statement?: X.Statement | number)
	{
		const startIdx = (() =>
		{
			if (!statement)
				return 0;
			
			if (statement instanceof X.Statement)
				return this.getStatementIndex(statement);
			
			return statement;
		})();
		
		for (let i = startIdx - 1; ++i < this.statements.length;)
		{
			const stmt = this.statements[i];
			if (!stmt.isWhitespace)
				yield stmt;
		}
	}
	
	/**
	 * Reads the Statement at the given position.
	 * Negative numbers read Statement starting from the end of the document.
	 */
	read(line: number)
	{
		const lineBounded = applyBounds(line, this.statements.length);
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
	private toIndex(statementOrIndex: X.Statement | number)
	{
		return statementOrIndex instanceof X.Statement ?
			this.getStatementIndex(statementOrIndex) :
			applyBounds(statementOrIndex, this.statements.length);
	}
	
	/** 
	 * Starts an edit transaction in the specified callback function.
	 * Edit transactions are used to synchronize changes made in
	 * an underlying file, typically done by a user in a text editing
	 * environment. System-initiated changes such as automated
	 * fixes, refactors, or renames do not go through this pathway.
	 * @param editFn The callback function in which to perform
	 * document mutation operations.
	 */
	edit(editFn: (facts: IDocumentMutator) => void)
	{
		if (this.inEdit)
			throw X.Exception.doubleTransaction();
		
		class insertCall { constructor(readonly text: string, readonly at: number) { } }
		class updateCall { constructor(readonly text: string, readonly at: number) { } }
		class deleteCall { constructor(readonly at: number, readonly count: number) { } }
		type callType = insertCall | updateCall | deleteCall;
		const calls: callType[] = [];
		
		let hasDelete = false;
		let hasInsert = false;
		let hasUpdate = false;
		
		this.inEdit = true;
		
		editFn({
			delete: (at = -1, count = 1) =>
			{
				calls.push(new deleteCall(at, count));
				hasDelete = true;
			},
			insert: (text: string, at = -1) =>
			{
				calls.push(new insertCall(text, at));
				hasInsert = true;
			},
			update: (text: string, at = -1) =>
			{
				calls.push(new updateCall(text, at));
				hasUpdate = true;
			}
		});
		
		if (calls.length === 0)
		{
			this.inEdit = false;
			return;
		}
		
		const hooks = this.program.hooks;
		
		// Begin the algorithm that determines the changeset,
		// and runs the appropriate invalidation and revalidation
		// hooks. This is wrapped in an IIFE because we need to
		// perform finalization at the bottom (and there are early
		// return points throughout the algorithm.
		(() =>
		{
			const hasMixed =
				(hasInsert && hasUpdate) ||
				(hasInsert && hasDelete) ||
				(hasUpdate && hasDelete);
			
			const boundAt = (call: callType) =>
				applyBounds(call.at, this.statements.length);
			
			const doDeleteAt = (call: deleteCall) =>
			{
				const at = boundAt(call);
				const deleted = this.statements.splice(at, call.count);
				
				deleted.forEach(del =>
				{
					this.statementIndexCache.delete(del);
					del.dispose();
				});
				
				this.shiftStatementIndexCache(at, -1);
				return deleted;
			};
			
			const doInsertAt = (call: insertCall) =>
			{
				const stmt = new X.Statement(this, call.text);
				if (call.at >= this.statements.length)
				{
					this.statementIndexCache.set(stmt, this.statements.length);
					this.statements.push(stmt);
				}
				else
				{
					const at = boundAt(call);
					this.statements.splice(at, 0, stmt);
					this.shiftStatementIndexCache(at, 1);
				}
			};
			
			const doUpdateAt = (call: updateCall) =>
			{
				const at = boundAt(call);
				const stmt = new X.Statement(this, call.text);
				this.statements[at].dispose();
				this.statements[at] = stmt;
				this.statementIndexCache.set(stmt, call.at);
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
					const updateCalls = (<updateCall[]>calls)
						.sort((a, b) => a.at - b.at)
						.filter((call, i) => i >= calls.length - 1 || call.at !== (<updateCall>calls[i + 1]).at);
					
					const oldStatements = updateCalls.map(c => this.statements[c.at]);
					const newStatements = updateCalls.map(c => new X.Statement(this, c.text));
					const indexes = Object.freeze(updateCalls.map(c => c.at));
					
					const noStructuralChanges = oldStatements.every((oldSt, idx) =>
					{
						const newSt = newStatements[idx];
						return (
							oldSt.indent === newSt.indent ||
							oldSt.isNoop && newSt.isNoop);
					});
					
					if (noStructuralChanges)
					{
						// Tell subscribers to blow away all the old statements.
						hooks.Invalidate.run(new X.InvalidateParam(
							this,
							oldStatements,
							indexes));
						
						// Run the actual mutations
						updateCalls.forEach(doUpdateAt);
						
						// Tell subscribers what changed
						hooks.Revalidate.run(new X.RevalidateParam(
							this, 
							newStatements,
							indexes));
						
						return;
					}
				}
			
				// This handles the second optimization, which is the case where
				// only deletes occured, and none of the deleted statements have any
				// descendants. This will handle the majority of "delete a line" cases.
				if (hasDelete)
				{
					const deleteCalls = <deleteCall[]>calls;
					const oldStatements: X.Statement[] = [];
					const oldIndexes: number[] = [];
					
					forCalls:
					for (const deleteCall of deleteCalls)
					{
						for (let i = -1; ++i < deleteCall.count;)
						{
							const oldStmt = this.statements[deleteCall.at + i];
							if (this.hasDescendants(oldStmt))
							{
								oldStatements.length = 0;
								break forCalls;
							}
							
							if (!oldStmt.isNoop)
							{
								oldStatements.push(oldStmt);
								oldIndexes.push(i);
							}
						}
					}
					
					if (oldStatements.length)
					{
						// Tell subscribers to blow away all the old statements.
						hooks.Invalidate.run(new X.InvalidateParam(
							this,
							oldStatements,
							oldIndexes));
						
						// Run the actual mutations
						deleteCalls.forEach(doDeleteAt);
						
						// Run an empty revalidation hook, to comply with the
						// rule that for every invalidation hook, there is always a
						// corresponding revalidation hook.
						hooks.Revalidate.run(new X.RevalidateParam(this, [], []));
						
						return;
					}
				}
				
				// This handles the third optimization, which is the case
				// where there are only noop statements being inserted
				// into the document.
				if (hasInsert)
				{
					const insertCalls = <insertCall[]>calls;
					const hasOnlyNoop = (() =>
					{
						for (const insertCall of insertCalls)
							if (!new X.Statement(this, insertCall.text).isNoop)
								return false;
						
						return true;
					})();
					
					if (hasOnlyNoop)
					{
						insertCalls.forEach(doInsertAt);
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
				
				if (call instanceof deleteCall)
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
					const newStatement = new X.Statement(this, call.text);
					
					if (call instanceof insertCall)
					{
						if (newStatement.isNoop)
							continue;
					}
					else if (call instanceof updateCall)
					{
						const oldStatement = this.statements[atBounded];
						
						if (oldStatement.isNoop && newStatement.isNoop)
							continue;
					}
					
					const parent = this.getParentFromPosition(
						call.at,
						newStatement.indent);
					
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
						
						if (ancestryShort.every((stmt, idx) => stmt === ancestryLong[idx]))
							invalidatedAncestries.splice(aLessB ? n : i, 1);
					}
				}
			}
			
			// Notify observers of the Invalidate hook to invalidate the
			// descendants of the specified set of parent statements.
			hooks.Invalidate.run(new X.InvalidateParam(
				this,
				mustInvalidateDoc ? [] : Array.from(invalidatedParents.values()),
				mustInvalidateDoc ? [] : Array.from(invalidatedParents.keys()),
			));
			
			const deletedStatements: X.Statement[] = [];
			
			// Perform the document mutations.
			for (const call of calls)
			{
				if (call instanceof deleteCall)
					deletedStatements.push(...doDeleteAt(call));
				
				else if (call instanceof insertCall)
					doInsertAt(call);
				
				else if (call instanceof updateCall)
					doUpdateAt(call);
			}
			
			// Remove any deleted statements from the invalidatedParents map
			for (const deletedStatement of deletedStatements)
				for (const [at, parentStatement] of invalidatedParents)
					if (deletedStatement === parentStatement)
						invalidatedParents.delete(at);
			
			// Notify observers of the Revalidate hook to update the
			// descendants of the specified set of parent statements.
			hooks.Revalidate.run(new X.RevalidateParam(
				this, 
				Array.from(invalidatedParents.values()),
				Array.from(invalidatedParents.keys())
			));
		})();
		
		// Tell subscribers that the edit transaction completed.
		hooks.EditComplete.run(new X.DocumentParam(this));
		
		this._version = X.VersionStamp.next();
		this.inEdit = false;
	}
	
	/** Stores the URI from where this document was loaded. */
	readonly sourceUri: X.Uri;
	
	/** A reference to the instance of the Compiler that owns this Document. */
	readonly program: X.Program;
	
	/**
	 * Stores the complete list of the Document's statements,
	 * sorted in the order that they appear in the file.
	 */
	private readonly statements: X.Statement[] = [];
	
	/**
	 * Shifts the cached statement indexes above the specified
	 * number, by the specified offset. Once the size of the cache
	 * grows past a certain threshold, the statement cache is cleared.
	 * Shifting the indexes of small caches is a simple optimization
	 * that allows the document to avoid throwing away the entire
	 * cache for many edits to the document.
	 */
	private shiftStatementIndexCache(above: number, offset: number)
	{
		const threshold = 1000;
		
		if (this.statementIndexCache.size > threshold)
			return this.statementIndexCache.clear();
		
		for (const [statement, index] of this.statementIndexCache)
			if (index > above)
				this.statementIndexCache.set(statement, index + offset);
	}
	
	/**
	 * Stores a cache of the indexes at which various statements
	 * are located in the statements array. Not all statements 
	 * contained in the document are stored in this array. The
	 * cache is built up and cleared over time.
	 */
	private readonly statementIndexCache = new Map<X.Statement, number>();
	
	/**
	 * A state variable that stores whether an
	 * edit transaction is currently underway.
	 */
	private inEdit = false;
	
	/**
	 * @internal
	 * A rolling version stamp that increments after each edit cycle.
	 */
	get version()
	{
		return this._version;
	}
	private _version = X.VersionStamp.next();
	
	/**
	 * Returns a formatted version of the Document.
	 */
	toString()
	{
		const lines: string[] = [];
		
		for (const { statement, level } of this.eachDescendant())
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
	delete(at: number, count: number): void;
}


/**
 * Generator function that yields all statements (unparsed lines)
 * of the given source text. 
 */
function* readLines(source: string)
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
