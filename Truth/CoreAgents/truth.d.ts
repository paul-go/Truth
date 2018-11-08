
declare namespace Truth {

	/**
	 * The top-level object that manages Truth documents.
	 */
	export class Program {
		/** */
		constructor();
		/** */
		readonly hooks: HookTypesInstance;
		/** */
		readonly agents: Agents;
		/** */
		readonly documents: DocumentGraph;
		/** */
		readonly types: TypeGraph;
		/** */
		readonly faults: FaultService;
		/**
		 * Begin inspecting the specified document,
		 * starting with the types defined at it's root.
		 */
		inspect(document: Document): ProgramInspectionSite;
		/**
		 * 
		 */
		inspect(document: Document, line: number, offset: number): ProgramInspectionSite;
		/**
		 * 
		 */
		inspect(document: Document, statement: Statement): ProgramInspectionSite;
		/**
		 * 
		 */
		inspect(document: Document, pointer: Pointer): ProgramInspectionSite;
	}
	/**
	 * Defines an area in a particular document where Program
	 * inspection can begin.
	 */
	export class ProgramInspectionSite {
		/** */
		private readonly program;
		/** */
		private readonly document;
		/** */
		private readonly line;
		/** */
		private readonly offset;
		/** */
		private readonly area;
		/** */
		private readonly statement;
		/** */
		private readonly pointer;
		/** */
		private readonly typeConstructor;
		/**
		 * Gets the statement that is the parent of this
		 * ProgramInspectionPoint's statement object.
		 * 
		 * In the case when this statement is top level,
		 * a reference to the statement's containing
		 * document is returned.
		 * 
		 * In the case when the inspection point has
		 * no logical parent, such as if the statement
		 * is a comment, the returned value is null.
		 */
		readonly parent: Statement | Document | null;
		private _parent;
		/**
		 * Gets information about any declaration found at
		 * the document location specified in the constructor
		 * parameters of this object.
		 * 
		 * Gets null in the case when something other than
		 * a declaration is found at the location.
		 */
		readonly declaration: DeclarationSite | null;
		private _declaration;
		/**
		 * Get information about any annotation found at
		 * the document location specified in the constructor
		 * parameters of this object.
		 * 
		 * Gets null in the case when something other than
		 * an annotation is found at the location.
		 */
		readonly annotation: AnnotationSite | null;
		private _annotation;
	}
	/**
	 * A class that allows access to the underlying
	 * Types defined at the point of one single
	 * subject within a document.
	 */
	export class DeclarationSite {
		constructor(pointer: Pointer, typeConstructor: TypeConstructor);
		/** */
		readonly pointer: Pointer;
		/**
		 * Stores a reference to the TypeConstructor object
		 * used across the current frame.
		 */
		private readonly typeConstructor;
		/**
		 * Gets the array of types referenced at the declaration site.
		 * Multiple types may be related to a single declaration site
		 * in the case when it's contained by a statement with multiple
		 * declarations.
		 */
		readonly types: ReadonlyArray<Type>;
		private _types;
	}
	/**
	 * 
	 */
	export class AnnotationSite {
		constructor(pointer: Pointer);
		/** */
		readonly subject: Subject;
		/**
		 * Gets an array representing the declaration sites that
		 * sit to the left of this annotation site in the document.
		 */
		readonly adjacentDeclarations: ReadonlyArray<DeclarationSite>;
		private _adjacentDeclarations;
		/**
		 * Gets an array representing the declaration sites that
		 * sit to the left of this annotation site in the document.
		 */
		readonly matches: ReadonlyArray<Match>;
		private _matches;
		/** */
		private readonly pointer;
	}
	/**
	 * A cache that stores all agents loaded by the compiler.
	 */
	export class Agents {
		/**
		 * Constructs an agent from the specified file, or from
		 * a cache if the specified file has already been read.
		 * @returns A reference to the added agent.
		 */
		add(sourceUri: Uri | string): Promise<Agent | null>;
		/**
		 * Removes the agent from the system having the specified source file path.
		 * @returns A boolean indicating whether an agent was deleted.
		 */
		delete(sourceUri: Uri | string): boolean;
		/** Stores a map of agent build functions, indexed by their absolute URI. */
		private readonly buildFunctionCache;
		/** Stores a set of all agents added to the system. */
		private readonly agentCacheObject;
	}
	/** */
	export class Agent {
		/** Stores an array of documents that reference this Agent. */
		readonly referencingDocuments: Document[];
		/** Stores the absolute path to the JavaScript file that contains the agent source code. */
		readonly sourceUri: Uri;
		/** Store the built-in hooks, as well as the hooks specified in the document. */
		readonly hooks: HookTypesInstance;
	}
	/**
	 * 
	 */
	export abstract class HookType<TIn extends object | void = object, TOut extends object | void = void> {
		private readonly router;
		private readonly agent;
		/**
		 * Adds a hook contributor function that executes in
		 * response to the running of hooks of the containing type.
		 */
		contribute(fn: (hookIn: Readonly<TIn>) => TOut | void): void;
		/**
		 * Adds a hook capturer function that runs after the hook contributors
		 * have returned their results. Hook capturer functions are passed an
		 * array containing the produced results of all the contributor functions.
		 */
		capture(fn: (hookIn: Readonly<TIn>) => void): void;
		/**
		 * Runs all hook contributor functions whose constructor matches the
		 * containing hook type. Then, all matching hook capturer functions are
		 * called, passing the return values generated by the contributor functions.
		 * @param hook An instance of the Hook to run.
		 */
		run(hookIn: TIn): TOut[];
	}
	/**
	 * Stores all of the hook types used across the entire system.
	 */
	export namespace HookTypes {
		/** A hooks that runs immediate after a document has been created. */
		class DocumentCreated extends HookType<DocumentParam> {
		}
		/** A hooks that runs immediately before a document is removed from the program. */
		class DocumentDeleted extends HookType<DocumentParam> {
		}
		/** A hook that runs when a document's file name changes. */
		class DocumentRenamed extends HookType<DocumentRenameParam> {
		}
		/** A base class for a hook that is run during type resolution events. */
		class Resolution extends HookType<ResolutionParam, ResolutionResult> {
		}
		/** A hook that runs before the core is about to resolve a term. */
		class BeforeResolve extends HookTypes.Resolution {
		}
		/** A hook that runs after the core has resolved a term. */
		class AfterResolve extends HookTypes.Resolution {
		}
		/** A hook that runs when the core is unable to resolve a particular term. */
		class NotResolved extends HookTypes.Resolution {
		}
		/** A base class for a hook that performs editor navigations. */
		class Navigation extends HookType<NavigationParam> {
		}
		/** A hook that runs when a "Find References" operation has been requested. */
		class FindReferences extends HookTypes.Navigation {
		}
		/** A hook that runs when a "Find Fragments" operation has been requested. */
		class FindFragments extends HookTypes.Navigation {
		}
		/** A hook that runs when a "Find Declarations" operation has been requested. */
		class FindDeclarations extends HookTypes.Navigation {
		}
		/** A hook that runs when a quick fix operation is requested. Not implemented. */
		class Fix<TIn extends object> extends HookType<TIn> {
		}
		/** A hook that runs when checking whether a rename operation can be executed. */
		class CanRename extends HookType<CanParam, CanResult> {
		}
		/** A hook that runs when a rename operation should be executed. */
		class DoRename extends HookType<DoRenameParam> {
		}
		/** A hook that runs when a dialog should be displayed. Not implemented. */
		class Dialog extends HookType<void> {
		}
		/** A hook that runs when completion. */
		class Completion extends HookType<CompletionParam, CompletionResult> {
		}
		/** */
		class Invalidate extends HookType<InvalidateParam> {
		}
		/** */
		class Revalidate extends HookType<RevalidateParam> {
		}
		/**
		 * A hook that runs when a document edit transaction has completed.
		 */
		class EditComplete extends HookType<DocumentParam> {
		}
		/**
		 * A hook that runs when a URI reference is added to a document,
		 * but before it resolves to a resource.
		 */
		class UriReferenceAdded extends HookType<UriReferenceParam, UriReferenceResult> {
		}
		/**
		 * A hook that runs when a URI reference is removed from a document.
		 */
		class UriReferenceRemoved extends HookType<UriReferenceParam> {
		}
		/** A hook that runs when a fault has been detected in a document. */
		class FaultReported extends HookType<FaultParam> {
		}
		/** A hook that runs when a fault has been rectified, and should be eliminated. */
		class FaultRectified extends HookType<FaultParam> {
		}
	}
	/** */
	export class DocumentParam {
		readonly document: Document;
		constructor(document: Document);
	}
	/** Input parameters for documents being renamed. */
	export class DocumentRenameParam {
		readonly document: Document;
		readonly oldUri: Uri;
		constructor(document: Document, oldUri: Uri);
	}
	/**
	 * 
	 */
	export class InvalidateParam {
		/**
		 * A reference to the Document object in which the Invalidation occured.
		 */
		readonly document: Document;
		/**
		 * An array of statements whose descendants should be invalidated.
		 * If the array is empty, the entire document should be invalidated.
		 */
		readonly parents: ReadonlyArray<Statement>;
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		readonly indexes: ReadonlyArray<number>;
		constructor(
		/**
		 * A reference to the Document object in which the Invalidation occured.
		 */
		document: Document,
		/**
		 * An array of statements whose descendants should be invalidated.
		 * If the array is empty, the entire document should be invalidated.
		 */
		parents: ReadonlyArray<Statement>,
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		indexes: ReadonlyArray<number>);
	}
	/**
	 * 
	 */
	export class RevalidateParam {
		/**
		 * A reference to the Document object in which the Revalidation will occur.
		 */
		readonly document: Document;
		/**
		 * An array of statements whose descendants should be revalidated.
		 */
		readonly parents: ReadonlyArray<Statement>;
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		readonly indexes: ReadonlyArray<number>;
		constructor(
		/**
		 * A reference to the Document object in which the Revalidation will occur.
		 */
		document: Document,
		/**
		 * An array of statements whose descendants should be revalidated.
		 */
		parents: ReadonlyArray<Statement>,
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		indexes: ReadonlyArray<number>);
	}
	/**
	 * Generic class that stores the inputs of a "Can" hook.
	 * "Can" hooks are hooks where the system needs to perform
	 * a pre-flight check to see if the command can be run at
	 * a certain position within a document.
	 */
	export class CanParam {
		readonly document: Document;
		readonly pointer: Pointer;
		constructor(document: Document, pointer: Pointer);
	}
	/** Generic class that stores the output of a "Can" hook. */
	export class CanResult {
		readonly value: boolean;
		constructor(value: boolean);
	}
	/** Input parameters for resolution hooks */
	export class ResolutionParam {
		readonly program: Program;
		readonly spine: Spine;
		constructor(program: Program, spine: Spine);
	}
	/** Output for resolution hooks */
	export class ResolutionResult {
		resolves: boolean;
	}
	/** Input parameters for navigation hooks. */
	export class NavigationParam {
		readonly document: Document;
		readonly initiatingTerm: Subject;
		constructor(document: Document, initiatingTerm: Subject);
	}
	/** */
	export class DoRenameParam {
		readonly document: Document;
		readonly pointer: Pointer;
		constructor(document: Document, pointer: Pointer);
	}
	/** Input parameters for completion hooks. */
	export class CompletionParam {
		readonly document: Document;
		readonly line: number;
		readonly offset: number;
		constructor(document: Document, line: number, offset: number);
	}
	/** Output for completion hooks. */
	export class CompletionResult {
		readonly items: LanguageServer.CompletionItem[];
		constructor(items: LanguageServer.CompletionItem[]);
	}
	/** */
	export class FillParam {
		readonly document: Document;
		constructor(document: Document);
	}
	/** */
	export class UriReferenceParam {
		readonly document: Document;
		readonly statement: Statement;
		readonly uri: Uri;
		constructor(document: Document, statement: Statement, uri: Uri);
	}
	/** */
	export class UriReferenceResult {
		readonly accepted: boolean;
		constructor(accepted: boolean);
	}
	/** */
	export class DeclareParam {
		readonly program: Program;
		readonly spine: Spine;
		constructor(program: Program, spine: Spine);
	}
	/** */
	export class DeclareResult {
		/**
		 * Assignable value to ignore the declaration
		 * of the term attempting to be declared.
		 */
		readonly ignoreTerm: boolean;
		/**
		 * Assignable value to ignore the declaration
		 * of all terms on the has-a side of the statement.
		 */
		readonly ignoreHasaTerms: boolean;
		/**
		 * Assignable value to ignore the declaration
		 * of all terms on the is-a side of the statement.
		 */
		readonly ignoreIsaTerms: boolean;
		constructor(
		/**
		 * Assignable value to ignore the declaration
		 * of the term attempting to be declared.
		 */
		ignoreTerm: boolean,
		/**
		 * Assignable value to ignore the declaration
		 * of all terms on the has-a side of the statement.
		 */
		ignoreHasaTerms: boolean,
		/**
		 * Assignable value to ignore the declaration
		 * of all terms on the is-a side of the statement.
		 */
		ignoreIsaTerms: boolean);
	}
	/** */
	export class FaultParam {
		readonly document: Document;
		readonly fault: Fault;
		constructor(document: Document, fault: Fault);
	}
	/** Defines an instantatiated version of the HookTypes namespace. */
	export type HookTypesInstance = {
		[P in keyof typeof HookTypes]: Readonly<InstanceType<typeof HookTypes[P]>>;
	};
	/**
	 * 
	 */
	export class Document {
		/**
		 * Fills the document with the specified source code.
		 * If the document is non-empty, it is emptied before being filled.
		 * @param source The source text to fill the document.
		 */
		private fill;
		/**
		 * @returns An array of Statement objects that represent
		 * ancestry of the specified statement. If the specified
		 * statement is not in this document, the returned value
		 * is null.
		 */
		getAncestry(statement: Statement | number): Statement[] | null;
		/**
		 * @returns The parent Statement object of the specified
		 * Statement. If the statement is top level, a reference to
		 * this document object is returned. If the statement is
		 * not found in the document, or the specified statement
		 * is a no-op, the returned value is null.
		 */
		getParent(statement: Statement | number): this | Statement | null;
		/**
		 * @returns The Statement that would act as the parent
		 * if a statement where to be inserted at the specified
		 * virtual position in the document. If an inserted
		 * statement would be top-level, a reference to this
		 * document object is returned.
		 */
		getParentFromPosition(virtualLine: number, virtualOffset: number): Statement | this;
		/**
		 * @returns The sibling Statement objects of the
		 * specified Statement. If the specified statement
		 * is not found in the document, or is a no-op, the
		 * returned value is null.
		 */
		getSiblings(statement: Statement | number): Statement[] | null;
		/**
		 * @returns The child Statement objects of the specified
		 * Statement. If the argument is null or omitted, the document's
		 * top-level statements are returned. If the specified statement
		 * is not found in the document, the returned value is null.
		 */
		getChildren(statement?: Statement | null): Statement[];
		/**
		 * @returns A boolean value that indicates whether the specified
		 * statement, or the statement at the specified index has any
		 * descendants. If the argument is null, the returned value is a
		 * boolean indicating whether this document has any non-noop
		 * statements.
		 */
		hasDescendants(statement: Statement | number | null): boolean;
		/**
		 * @returns The index of the specified statement in
		 * the document, relying on caching when available.
		 * If the statement does not exist in the document,
		 * the returned value is -1.
		 */
		getStatementIndex(statement: Statement): number;
		/**
		 * @returns An array of strings containing the content
		 * written in the comments directly above the specified
		 * statement. Whitespace lines are ignored. If the specified
		 * statement is a no-op, an empty array is returned.
		 */
		getNotes(statement: Statement | number): string[];
		/**
		 * Enumerates through statements in the document,
		 * optionally including no-ops.
		 */
		eachStatement(includeNoops?: boolean): IterableIterator<{
			statement: Statement;
			position: number;
		}>;
		/**
		 * Reads the Statement at the given position.
		 * Negative numbers read Statement starting from the end of the document.
		 */
		read(line: number): Statement;
		/**
		 * Convenience method that converts a statement or it's index
		 * within this document to a statement object.
		 */
		private toStatement;
		/**
		 * Convenience method to quickly turn a value that may be
		 * a statement or a statement index, into a bounded statement
		 * index.
		 */
		private toIndex;
		/**
		 * Visits each statement that is a descendant of the specified
		 * statement. If the parameter is null or omitted, all statements
		 * in this Document are visited.
		 * 
		 * The method yields an object that contains the visited statement,
		 * as well as a numeric level value that specifies the difference in
		 * the number of nesting levels between the specified initialStatement
		 * and the visited statement.
		 * 
		 * @param initialStatement A reference to the statement object
		 * from where the enumeration should begin.
		 * 
		 * @param includeInitial A boolean value indicating whether or
		 * not the specified initialStatement should also be returned
		 * as an element in the enumeration. If true, initialStatement
		 * must be non-null.
		 */
		visitDescendants(initialStatement?: Statement | null, includeInitial?: boolean): IterableIterator<{
			level: number;
			statement: Statement;
		}>;
		/**
		 * Starts an edit transaction in the specified callback function.
		 * Edit transactions are used to synchronize changes made in
		 * an underlying file, typically done by a user in a text editing
		 * environment. System-initiated changes such as automated
		 * fixes, refactors, or renames do not go through this pathway.
		 * @param editFn The callback function in which to perform
		 * document mutation operations.
		 */
		edit(editFn: (facts: IDocumentMutator) => void): void;
		/** Stores the URI from where this document was loaded. */
		readonly sourceUri: Uri;
		/** A reference to the instance of the Compiler that owns this Document. */
		readonly program: Program;
		/**
		 * Stores the complete list of the Document's statements,
		 * sorted in the order that they appear in the file.
		 */
		private readonly statements;
		/**
		 * Shifts the cached statement indexes above the specified
		 * number, by the specified offset. Once the size of the cache
		 * grows past a certain threshold, the statement cache is cleared.
		 * Shifting the indexes of small caches is a simple optimization
		 * that allows the document to avoid throwing away the entire
		 * cache for many edits to the document.
		 */
		private shiftStatementIndexCache;
		/**
		 * Stores a cache of the indexes at which various statements
		 * are located in the statements array. Not all statements
		 * contained in the document are stored in this array. The
		 * cache is built up and cleared over time.
		 */
		private readonly statementIndexCache;
		/**
		 * A state variable that stores whether an
		 * edit transaction is currently underway.
		 */
		private inEdit;
		/**
		 * Returns a formatted version of the Document.
		 */
		toString(): string;
	}
	/**
	 * Represents an interface for creating a
	 * batch of document mutation operations.
	 */
	interface IDocumentMutator {
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
	 * A class that stores all the documents loaded into a
	 * program, and the inter-dependencies between them.
	 */
	export class DocumentGraph {
		/** */
		constructor(program: Program);
		/**
		 * Reads a Document from the specified URI.
		 * The document is created and returned, asynchronously.
		 */
		read(uri: Uri | string): Promise<Error | Document>;
		/**
		 * Creates a temporary document that will exist only in memory.
		 * The document may not be linked to other documents in the
		 * graph.
		 */
		create(): Document;
		/**
		 * Creates a temporary document that will exist only in memory,
		 * which is initialized with the specified source text. The document
		 * may not be linked to other documents in the graph.
		 */
		create(sourceText: string): Document;
		/**
		 * Creates a document that was read from the specified URI,
		 * with the specified sourceText. If the content still needs to be
		 * read from a URI, use the .read() method.
		 */
		create(uri: Uri | string, sourceText: string): Document;
		/**
		 * Blocks execution until all queued IO operations have completed.
		 */
		await(): Promise<void>;
		/**
		 * @returns The document loaded into this graph
		 * with the specified URI.
		 */
		get(uri: Uri | string): Document | null;
		/**
		 * @returns An array containing all documents
		 * loaded into this graph.
		 */
		getAll(): Document[];
		/**
		 * Deletes a document that was previously loaded into the compiler.
		 * Intended to be called by the host environment when a file changes.
		 */
		delete(target: Document | Uri | string): void;
		/**
		 * Removes all documents from this graph.
		 */
		clear(): void;
		/**
		 * @returns An array containing the dependencies
		 * associated with the specified document.
		 */
		getDependencies(doc: Document): Document[];
		/**
		 * @returns An array containing the dependents
		 * associated with the specified document.
		 */
		getDependents(doc: Document): Document[];
		/**
		 * Attempts to add a link from one document to another,
		 * via the specified URI. If there is some reason why the
		 * link cannot be established, (circular references, bad
		 * URIs), no link is added, and a fault is reported.
		 */
		private tryLink;
		/**
		 * An array of functions that should be executed when
		 * all outstanding async operations have completed.
		 */
		private waitFns;
		/**
		 * Counts the number of async operations in progress.
		 */
		private asyncCount;
		/**
		 * Checks to see if the addition of a reference between the two
		 * specified documents would result in a document graph with
		 * circular relationships.
		 * 
		 * The algorithm used performs a depth-first dependency search,
		 * starting at the candidateTo. If the traversal pattern is able to
		 * make its way to candidateFrom, it can be concluded that the
		 * addition of the proposed reference would result in a cyclical
		 * relationship.
		 */
		private wouldCreateCycles;
		/**
		 * Adds a dependency between two documents in the graph.
		 * If a dependency between the two documents already exists,
		 * the reference count of the dependency is incremented.
		 * This method is executed only after other methods have
		 * indicated that the addition of the link will not cause conflict.
		 */
		private link;
		/**
		 * Removes a dependency between two documents in the graph.
		 * If the reference count of the dependency is greater than 1, the
		 * the reference count is decremented instead of the dependency
		 * being removed completely.
		 */
		private unlink;
		/**
		 * A map of documents loaded into the graph,
		 * indexed by their URIs.
		 */
		private readonly documents;
		/**
		 * A map of each document's dependencies.
		 */
		private readonly dependencies;
		/**
		 * A map of the documents that depend on each document.
		 */
		private readonly dependents;
		/** */
		private readonly program;
		/**
		 * Converts the contents of this DocumentGraph to a
		 * string representation, useful for testing purposes.
		 */
		toString(): string;
	}
	/**
	 * 
	 */
	export class Statement {
		/** */
		constructor(document: Document, text: string);
		/** Gets whether the statement is a comment. */
		readonly isComment: boolean;
		/** Gets whether the statement contains no non-whitespace characters. */
		readonly isWhitespace: boolean;
		/** Gets whether the statement is a comment or whitespace. */
		readonly isNoop: boolean;
		/** Gets whether the statement has been removed from it's containing document. */
		readonly isDisposed: boolean;
		/** Stores a reference to the document that contains this statement. */
		readonly document: Document;
		/** Stores the indent level of the statement. */
		readonly indent: number;
		/** */
		readonly hasaSubjects: SubjectBoundaries;
		/** */
		readonly isaSubjects: SubjectBoundaries;
		/**
		 * Stores the position at which the joint operator exists
		 * in the statement. A negative number indicates that
		 * the joint operator does not exist in the statement.
		 */
		readonly jointPosition: number;
		/**
		 * Stores the unprocessed text content of the statement,
		 * as it appears in the document.
		 */
		readonly textContent: string;
		/**
		 * Returns contextual statement information relevant at
		 * the specified character offset. If a pointer exists at the
		 * specified, offset, it is included in the returned object.
		 */
		inspect(offset: number): {
			side: ReadonlyMap<number, Subject | null>;
			region: StatementRegion;
			pointer: Pointer | null;
		};
		/**
		 * Gets the kind of StatementArea that exists at the
		 * given character offset within the Statement.
		 */
		getAreaKind(offset: number): StatementAreaKind;
		/**
		 * @returns A pointer to the has-a subject at the specified offset,
		 * or null if there is no has-a subject at the specified offset.
		 */
		getDeclaration(offset: number): Pointer | null;
		/**
		 * @returns A pointer to the is-a subject at the specified offset,
		 * or null if there is no is-a subject at the specified offset.
		 */
		getAnnotation(offset: number): Pointer | null;
		/**
		 * Gets the set of pointers in that represent all declarations
		 * and annotations in this statement, from left to right.
		 */
		readonly subjects: Pointer[];
		/**
		 * Gets the set of pointers in that represent the
		 * declarations of this statement, from left to right.
		 */
		readonly declarations: Pointer[];
		private _declarations;
		/**
		 * Gets the set of pointers in that represent the
		 * annotations of this statement, from left to right.
		 */
		readonly annotations: Pointer[];
		private _annotations;
		/**
		 * @returns A string containing the inner comment text of
		 * this statement, excluding the comment syntax token.
		 * If the statement isn't a comment, null is returned.
		 */
		getCommentText(): string | null;
		/**
		 * Converts the statement to a formatted string representation.
		 */
		toString(includeIndent?: boolean): string;
	}
	/**
	 * Stores a map of the character offsets within a Statement
	 * that represent the starting positions of the statement's
	 * Subjects.
	 */
	export type SubjectBoundaries = ReadonlyMap<number, Subject | null>;
	/**
	 * Defines the areas of a statement that are significantly
	 * different when performing inspection.
	 */
	export enum StatementAreaKind {
		/** */
		void = 0,
		/** */
		whitespace = 1,
		/** */
		declaration = 2,
		/** */
		annotation = 3,
		/** */
		declarationVoid = 4,
		/** */
		annotationVoid = 5
	}
	enum StatementRegion {
		/**
		 * A region cannot be inferred from the statement, because it is a no-op.
		 */
		none = 0,
		/**
		 * The cursor is at left-most position on the line.
		 */
		preStatement = 1,
		/**
		 * The cursor is at the left-most position on the line,
		 * and whitespace characters are on the right.
		 * 
		 * Example:
		 * |...
		 */
		preIndent = 2,
		/**
		 * The cursor has indent-related whitespace characters
		 * on both it's left and right.
		 * 
		 * Example:
		 * ..|..subject : subject
		 */
		midIndent = 4,
		/**
		 * The cursor has zero or more whitespace characters on its left,
		 * and zero non-whitespace characters on its right.
		 * 
		 * Example:
		 * ...|
		 */
		postIndent = 8,
		/**
		 * The cursor is positioned direct before, directly after, or between
		 * the characters of a has-a subject.
		 * 
		 * Example:
		 * ...|subject : subject
		 */
		hasaWord = 16,
		/**
		 * The cursor has zero or more whitespace characters on it's left,
		 * preceeded by a comma, preceeded by a has-a subject, and either
		 * one or more whitespace characters to it's right, or the statement
		 * separator.
		 * 
		 * Example:
		 * subject| : subject
		 */
		postHasaWord = 32,
		/**
		 * The cursor has zero or more whitespace characters on it's left,
		 * which are preceeded by the statement separator.
		 * 
		 * Example:
		 * subject |: subject
		 */
		preJoint = 64,
		/**
		 * The cursor has zero or more whitespace characters on it's left,
		 * which are preceeded by the statement separator.
		 * 
		 * Example:
		 * subject :| subject
		 */
		postJoint = 128,
		/**
		 * The cursor is positioned direct before, directly after,
		 * or bettween the characters of an is-a subject.
		 * 
		 * Example:
		 * subject : subject|, subject
		 */
		isaWord = 256,
		/**
		 * The cursor has zero or more whitespace characters on it's left,
		 * preceeded by a comma, preceeded by an is-a subject, and either
		 * one or more whitespace characters to it's right, or the statement
		 * terminator.
		 * 
		 * Example:
		 * subject : subject,| subject
		 */
		postIsaWord = 512,
		/**
		 * The cursor is at the very last position of the line.
		 * 
		 * Example:
		 * subject : subject|
		 */
		postStatement = 1024
	}
	/**
	 * A class that represents a single subject in a Statement.
	 * Consumers of this class should not expect Subject objects
	 * to be long-lived, as they are discarded regularly after edit
	 * transactions complete.
	 */
	export class Subject {
		/** */
		constructor(text: string);
		/** */
		readonly name: string;
		/** */
		readonly pluralized: boolean;
		/**
		 * Stores the text of the URI when in the subject is
		 * formatted as such. When the subject does not
		 * form a URI, this field is an empty string.
		 */
		readonly uri: Uri | null;
		/** Calculates whether this Subject is structurally equal to another. */
		equals(other: Subject | string | null): boolean;
		/** Converts this Subject to it's string representation. */
		toString(): string;
	}
	/**
	 * A class that represents a position in a statement.
	 */
	export class Pointer {
		/** */
		constructor(statement: Statement, subject: Subject | null, atDeclaration: boolean, atAnnotation: boolean, offsetStart: number);
		/**
		 * Gets an array of statements that represent the statement
		 * containment progression, all the way back to the containing
		 * document.
		 */
		readonly ancestry: ReadonlyArray<Statement>;
		private _ancestry;
		/** Stores a reference to the Statement that contains this Pointer. */
		readonly statement: Statement;
		/**
		 * Stores either a reference to the instance of the Subject that this
		 * Pointer represents, or a unique string in the case when this is
		 * a "Thin Pointer" that represents an Invisible Subject.
		 */
		readonly subject: Subject | string;
		/** */
		readonly atDeclaration: boolean;
		/** */
		readonly atAnnotation: boolean;
		/**
		 * The offset in the statement that marks the start of the
		 * region being pointed to.
		 */
		readonly offsetStart: number;
		/**
		 * The offset in the statement that marks the end of the
		 * region being pointed to.
		 */
		readonly offsetEnd: number;
		/**
		 * Splits apart the groups subjects specified in the containing
		 * statement's ancestry, and generates a series of spines,
		 * each indicating a separate pathway of declarations through
		 * the ancestry that reach the location in the document
		 * referenced by this global pointer object.
		 * 
		 * The generated spines are referentially opaque. Running this
		 * method on the same Pointer object always returns the same
		 * Spine instance.
		 */
		factor(): ReadonlyArray<Spine>;
		/**  */
		private factoredSpines;
	}
	/**
	 * A class that manages an array of Pointer objects that
	 * represent a specific spine of declarations, starting at
	 * a document, passing through a series of pointers,
	 * and ending at a tip pointer.
	 */
	export class Spine {
		/** */
		constructor(nodes: Pointer[]);
		/** Stores the last pointer in the array of segments. */
		readonly tip: Pointer;
		/** */
		readonly statement: Statement;
		/** Gets a reference to the document that sits at the top of the spine. */
		readonly document: Document;
		/**  */
		readonly nodes: ReadonlyArray<Pointer>;
	}
	/**
	 * A class that defines a type defined within a scope.
	 * A type may be composed of multiple pointers across
	 * multiple localities, as represented by the .pointers
	 * field.
	 */
	export class Type {
		/**
		 * 
		 */
		constructor(pointers: ReadonlyArray<Pointer>);
		/** */
		readonly name: Subject;
		/** */
		readonly parentType: Type;
		/** Stores an array of Types that base this one. */
		readonly bases: ReadonlyArray<Type>;
		/**
		 * Stores an array of annotations which failed to resolve as bases,
		 * but were successfully resolved by regular expressions. The array is
		 * sorted in the order in which the annotations appear in the document.
		 */
		readonly matchables: ReadonlyArray<Match>;
		/** Stores an array of pointers to has-a side subjects that compose this Type. */
		readonly fragments: ReadonlyArray<Pointer>;
		/** */
		readonly isSpecified: boolean;
		/** */
		readonly isOverride: boolean;
		/** */
		readonly isIntroduction: boolean;
		/**
		 * The set of types that exist in supers that are equivalently
		 * named as the type that this TypeInfo object represents,
		 * that contribute to the construction of this type. If this
		 * Type is an introduction, the array is empty.
		 */
		readonly sources: ReadonlyArray<Type>;
		/** Gets the plurality status of the type. */
		readonly plurality: Plurality;
		private _plurality;
		/**
		 * Gets an array containing all child Types of this one, whether
		 * they're specified, unspecified, overriddes, or introductions.
		 */
		readonly childTypes: Type[];
		private _childTypes;
	}
	/**
	 * Stores the plurality status of a Type.
	 */
	export enum Plurality {
		/** Indicates that no plurality information is attached to the type. */
		none = 0,
		/** Indicates that the type, or one of it's supers, has been pluralized. */
		pluralized = 1,
		/** Indicates that the type has been singularized. */
		singularized = 2,
		/** Indicates a conflict in the type's supers about the plurality status. */
		erroneous = 3
	}
	/** */
	export class Match {
		readonly text: string;
		readonly bases: ReadonlyArray<Type>;
		constructor(text: string, bases: ReadonlyArray<Type>);
	}
	/**
	 * A class that carries out the type construction process.
	 */
	export class TypeConstructor {
		private readonly program;
		/** */
		constructor(program: Program);
		/** */
		exec(spine: Spine): Type;
		/** */
		private tryInference;
	}
	/** */
	export enum UriProtocol {
		none = 0,
		file = 1,
		https = 2,
		http = 3,
		internal = 4,
		unsupported = 5
	}
	/**
	 * A class that represents a Truth URI.
	 * A Truth URI can point to a truth file, or an agent through a variety of
	 * different protocols, just like a normal URI. However, a Truth URI that
	 * points to a Truth file can also point to declarations within that file
	 * directly in the URI, using the double slash syntax. For example:
	 * 
	 * //domain.com/File.truth//Path/To/Declaration
	 */
	export class Uri {
		/** */
		static create(uri: Uri | string, relativeTo?: Uri | Document | null): Uri | null;
		/** Creates a type URI from the specified Spine object. */
		static createFromSpine(spine: Spine): Uri;
		/** Creates a unique internal URI. */
		static createInternal(): Uri;
		/** */
		protected constructor(rawUri: string, relativeTo?: Uri | Document | null);
		/**
		 * Stores a reference to the protocol used by the URI.
		 */
		readonly protocol: UriProtocol;
		/**
		 * Stores the file name specified in the URI, if one exists.
		 */
		readonly fileName: string;
		/**
		 * Stores the base file name specified in the URI.
		 * For example, for the URI path/to/dir/file.ext, base would
		 * be the string "file". If the URI does not contain a file
		 * name, the field is an empty string.
		 */
		readonly fileNameBase: string;
		/**
		 * Stores the extension of the file specified in the URI,
		 * without the dot character. If the URI does not contain
		 * a file name, the field is an empty string.
		 */
		readonly fileExtension: string;
		/**
		 * Stores the fully qualified path to the file, and the file
		 * name itself, but without any protocol.
		 */
		readonly ioPath: string;
		/**
		 * Stores the contents of any type path specified in the URI.
		 */
		readonly typePath: ReadonlyArray<string>;
		/**
		 * Converts the URI to a fully-qualified path including the file name.
		 */
		toString(includeProtocol?: boolean, includeTypePath?: boolean): string;
		/**
		 * @returns A value indicating whether two URIs point to the same resource.
		 */
		equals(uri: Uri | string): boolean;
		/**
		 * @returns A copy of this Uri, but with mutable properties.
		 */
		toMutable(): {
			/** */
			ioPath: string;
			/** */
			typePath: ReadonlyArray<string>;
			/** Creates an immutable URI from this MutableUri object. */
			freeze(): Uri;
			/**
			 * Stores a reference to the protocol used by the URI.
			 */
			readonly protocol: UriProtocol;
			/**
			 * Stores the file name specified in the URI, if one exists.
			 */
			readonly fileName: string;
			/**
			 * Stores the base file name specified in the URI.
			 * For example, for the URI path/to/dir/file.ext, base would
			 * be the string "file". If the URI does not contain a file
			 * name, the field is an empty string.
			 */
			readonly fileNameBase: string;
			/**
			 * Stores the extension of the file specified in the URI,
			 * without the dot character. If the URI does not contain
			 * a file name, the field is an empty string.
			 */
			readonly fileExtension: string;
			/**
			 * Converts the URI to a fully-qualified path including the file name.
			 */
			toString(includeProtocol?: boolean | undefined, includeTypePath?: boolean | undefined): string;
			/**
			 * @returns A value indicating whether two URIs point to the same resource.
			 */
			equals(uri: string | Uri): boolean;
			toMutable(): any;
		};
	}
	/** */
	export class UriReader {
		/**
		 * Attempts to read the contents of the given URI.
		 * If an error is generated while trying to read a file
		 * at the specified location, the errors is returned.
		 */
		static tryRead(uri: Uri): Promise<string | Error>;
	}
	/**
	 * An enumeration that stores language syntax tokens.
	 */
	export const enum Syntax {
		tab = "\t",
		space = " ",
		terminal = "\n",
		combinator = ",",
		joint = ":",
		pluralizer = "...",
		regexDelimiter = "/",
		escapeChar = "\\",
		comment = "// ",
		truthExtension = "truth",
		agentExtension = "js"
	}
	/**
	 * A class that manages the diagnostics that have been
	 * reported for the current state of the program.
	 */
	export class FaultService {
		private readonly program;
		/** */
		constructor(program: Program);
		/**
		 * Reports a fault. If a similar Fault on the same area
		 * of the document hasn't been reported, the method
		 * runs the FaultReported hook.
		 */
		report(fault: Fault): void;
		/**
		 * Gets a number representing the number of
		 * unrectified faults retained by this FaultService.
		 */
		readonly count: number;
		/**
		 * @returns A boolean value indicating whether this
		 * FaultService retains a fault that is similar to the specified
		 * fault (meaning that it has the same code and source).
		 */
		has(similarFault: Fault): boolean;
		/**
		 * Enumerates through the unrectified faults retained
		 * by this FaultService.
		 */
		each(): IterableIterator<Fault>;
		/**
		 * Broadcasts all reports stored in activeContext,
		 * and creates a new activeContext.
		 */
		private broadcastReports;
		/** */
		private inEditTransaction;
		/**
		 * A rolling, mutable field that is used as the build target of the
		 * faults found in the current frame.
		 */
		private activeContext;
	}
	/** */
	export type FaultSource = Statement | Pointer;
	/** Base class for all faults. */
	export abstract class Fault {
		/** */
		readonly severity: FaultSeverity;
		/** A human-readable description of the fault. */
		readonly abstract message: string;
		/** An error code, useful for reference purposes, or display in a user interface. */
		readonly abstract code: number;
		/** The document object that caused the fault to be reported. */
		readonly abstract source: FaultSource;
	}
	/** Base class for faults that relate to a specific statement. */
	export abstract class StatementFault extends Fault {
		readonly source: Statement;
		constructor(source: Statement);
	}
	/** Base class for faults that relate to a specific pointer. */
	export abstract class PointerFault extends Fault {
		readonly source: Pointer;
		constructor(source: Pointer);
	}
	/** */
	export enum FaultSeverity {
		/** Reports an error. */
		error = 1,
		/** Reports a warning. */
		warning = 2
	}
	/** */
	export class UnresolvedResourceFault extends StatementFault {
		constructor(source: Statement, error?: Error);
		readonly code = 1000;
		readonly message = "URI points to a resource that could not be resolved.";
	}
	/** */
	export class CircularResourceReferenceFault extends StatementFault {
		readonly code = 1001;
		readonly message = "URI points to a resource that would cause a circular reference.";
	}
	/** */
	export class InsecureResourceReferenceFault extends StatementFault {
		readonly code = 1002;
		readonly message: string;
	}
	/** */
	export class UnresolvedAnnotationFault extends PointerFault {
		readonly code = 1101;
		readonly message = "Unresolved annotation.";
	}
	/** */
	export class CircularTypeDependencyFault extends PointerFault {
		readonly code = 1102;
		readonly message = "Circular type dependency detected.";
	}
	/** */
	export class NonCovariantAnnotationsFault extends StatementFault {
		readonly code = 1103;
		readonly severity = FaultSeverity.warning;
		readonly message = "Overridden types must explicitly expand the type as defined in the base.";
	}
	/** */
	export class AnonymousTypeOnPluralFault extends StatementFault {
		readonly code = 1200;
		readonly message = "Anonymous types cannot be defined on a plural.";
	}
	/** */
	export class DoubleSidedPluralFault extends StatementFault {
		readonly code = 1201;
		readonly message = "Pluralization cannot exist on both sides of a statement.";
	}
	/** */
	export class MultiplicatePluralizationFault extends StatementFault {
		readonly code = 1202;
		readonly message = "Cannot pluralize an already pluralized type.";
	}
	/** */
	export class InvalidPluralChildFault extends StatementFault {
		readonly code = 1203;
		readonly message = "The containing plural cannot contain children of this type.";
	}
	/** */
	export class DeclarationSingularizationFault extends StatementFault {
		readonly code = 1204;
		readonly message = "Singularization cannot exist on the left side of a statement.";
	}
	/** */
	export class ExpressionInvalidFault extends StatementFault {
		readonly code = 1300;
		readonly message = "Invalid Regular Expression.";
	}
	/** */
	export class ExpressionPossiblyMatchesEmptyFault extends StatementFault {
		readonly code = 1301;
		readonly message = "Regular expression could possibly match an empty list of characters.";
	}
	/** */
	export class ExpressionDoesNotMatchBasesFault extends StatementFault {
		readonly code = 1302;
		readonly message = "Regular Expression does not match it's base types.";
	}
	/** */
	export class ExpressionAliasingPluralFault extends StatementFault {
		readonly code = 1303;
		readonly message = "Regular Expressions cannot alias a plural.";
	}
	/** */
	export class NamedEntitiesInRepeatingPatternFault extends StatementFault {
		readonly code = 1304;
		readonly message = "Named entities cannot exist in a repeating pattern.";
	}
	/** */
	export class ExpressionDescendentsFault extends StatementFault {
		readonly code = 1305;
		readonly message = "Regular Expression statements cannot have descendant statements.";
	}
	/** */
	export class TabsAndSpacesFault extends StatementFault {
		readonly code = 2000;
		readonly message = "Statement indent contains a mixture of tabs and spaces.";
		readonly severity = FaultSeverity.warning;
	}
	/**
	 * 
	 */
	export class Fragmenter {
		private readonly program;
		/** */
		constructor(program: Program);
		/**
		 * Updates contents of the Fragmenter to include the
		 * contents of the specified document.
		 */
		private handleDocumentAdded;
		/**
		 * Updates contents of the Fragmenter to exclude the
		 * contents of the specified document.
		 */
		private handleDocumentRemoved;
		/**
		 * Performs a defragmentation query, starting at the
		 * specified URI.
		 * 
		 * @returns An array of Defragment objects that target all
		 * fragments of the type implied by specified pointer.
		 * @returns Null in the case when the pointer targets
		 * an unpopulated location.
		 */
		lookup(uri: Uri, returnType: typeof TargetedLookup): Pointer[] | null;
		lookup(spine: Spine, returnType: typeof TargetedLookup): Pointer[] | null;
		lookup(uri: Uri, returnType: typeof DescendingLookup): DescendingLookup | null;
		lookup(spine: Spine, returnType: typeof DescendingLookup): DescendingLookup;
		lookup(uri: Uri, returnType: typeof SiblingLookup): SiblingLookup | null;
		lookup(spine: Spine, returnType: typeof SiblingLookup): SiblingLookup;
		/**
		 * Stores the declarations of the specified statement, and
		 * all of the declarations in it's descendant statements in
		 * the internal caches.
		 * 
		 * The statement object specified in the storeTarget parameter
		 * is expected to not be stored in the internal caches.
		 */
		private storeStatement;
		/**
		 * Removes the fragments associated with the specified pointer
		 * from all internal caches.
		 */
		private unstorePointer;
		/** */
		private cacheFragment;
		/** */
		private uncacheFragment;
		/**
		 * A map used to quickly find the fragments associated with a pointer.
		 * A separate fragment will exist in the array value for every spine
		 * ending at the Pointer key. Naturally, Pointers that are directly
		 * contained by a Document will only ever have one item in it's
		 * associated fragment array.
		 * 
		 * Note that the fragments in the array value may be parented by
		 * different apexes (meaning Pointers or Documents).
		 * 
		 * Although provisions are taken to ensure entries in this map are
		 * all explicitly released, a WeakMap is used in this case instead of
		 * a traditional Map as a defense measure against unforeseen bugs
		 * resulting in memory leaks.
		 */
		private readonly fragmentFinder;
		/**
		 * A map of the Document objects loaded into the system,
		 * and the top-level fragment objects to which they map.
		 */
		private readonly documents;
		/**
		 * Converts the contents of the Fragmenter to a string
		 * representation, useful for testing purposes.
		 */
		toString(): string;
	}
	/**
	 * A class of methods that execute the vertification-supporting
	 * operations of the system.
	 */
	export class Operations {
		private readonly program;
		/**
		 * Collects all annotations that have been applied to the
		 * type referenced by the specified Pointer.
		 * 
		 * @returns An array of types representing the collected
		 * annotations, but with any redundant types pruned.
		 */
		execAnnotationCollection(declaration: Pointer): Subject[];
		/**
		 * 
		 */
		execFindSupergraphEquivalents(): void;
		/**
		 * 
		 */
		execFindAncestorEquivalents(): void;
		/**
		 * Attempts to infer the type associated with the
		 * specified declaration-side Pointer. Performs base
		 * type inference, falling back to ancestry type
		 * inference if base type inference fails.
		 * 
		 * @returns Null in the case when there are is-a side
		 * types defined on the type referenced by the
		 * specified Pointer, and the associated type is
		 * therefore explicit rather than inferrable.
		 */
		execInference(declaration: Pointer): null | undefined;
		/**
		 * Attempts to infer the bases that should be implicitly
		 * applied to the specified type, by searching for equivalently
		 * named types contained within the specified type's
		 * Supergraph.
		 * 
		 * @param origin The type on which to perform inference.
		 * It is expected to be unannotated.
		 * 
		 * @returns An array of types representing the inferred
		 * bases. In the case when the specified type has multiple
		 * supers, and two or more of these supers have a type
		 * whose name matches the specified type, but differ
		 * in their bases, multiple bases may be inferred and
		 * and included in the returned array. However, this only
		 * happens in the case when these bases cannot be
		 * pruned down to a single type.
		 * 
		 * If no bases could be inferred, an empty array is
		 * returned.
		 */
		execSupergraphInference(origin: Type): Type[] | null;
		/**
		 * A strategy for inference that occurs when the
		 * type is an unbased introduction. Operates by
		 * scanning up the ancestry to determine if there
		 * is a matching type.
		 * 
		 * Attempts to infer the bases that should be added
		 * applied to the specified type, by searching for the
		 * type's equivalents named types explicitly specified
		 * within the specified type's ancestry of scopes.
		 * 
		 * @param origin The type on which to perform
		 * inference. It is expected to be unannotated.
		 * 
		 * @returns A type object representing the inferred
		 */
		execAncestorInference(origin: Type): Type | null;
		/**
		 * Performs the Polymorphic Base Resolution (PTR)
		 * algorithm as defined by the specification.
		 * 
		 * @returns An array of types that found at
		 * 
		 * Base resolution occurs when trying to resolve the
		 * basings of a given type.
		 * 
		 * The result of this method is a either the fully computed
		 * base-tree, or a base-tree that is sufficiently constructed
		 * to the point where a guarantee can be made about the
		 * origins of the type referenced in the specified Pointer.
		 */
		execResolution(origin: Pointer): Type[];
		/**
		 * 
		 * Computes the set of types imposed by bases of
		 * containing types.
		 * 
		 * If the parent type is a plural, the contract is not computed
		 * in a way that has anything to do with equivalents. The
		 * algorithm simply looks at the bases defined by the
		 * parent type, and uses these types as the contract.
		 * 
		 * Computes the set of types with which a specified
		 * type T is expected to comply. The argument is a
		 * has-a side pointer that references the type T.
		 * If type T is being introduced (as opposed to being
		 * overridden) in the scope where hasaPointer is
		 * pointing, then T has an open contract, and
		 * null is returned.
		 */
		execFindExpectation(declaration: Pointer): Type;
		/**
		 * The plurality of a type is computed by traversing the
		 * type's supergraph and determining if all pathways
		 * leading back to all root bases involve crossing the
		 * path of a pluralized type. In the case when one or more
		 * of these pathways cross pluralized types, and one or
		 * more do not, an error is generated.
		 */
		execPluralityCheck(origin: Type): void;
		/**
		 * Executes a search for all terms that are visible
		 * at the specified location.
		 * 
		 * The argument
		 * 
		 * @returns ?
		 */
		execReusablesSearch(statement: Statement): void;
		/**
		 * Executes a search for all terms that are dependent
		 * upon a type T, referenced via the specified has-a
		 * side Pointer.
		 * 
		 * The search occurs across the scope in which the
		 * specified Pointer exists, and continues deeply into
		 * any scopes nested inside.
		 * 
		 * @returns An array containing Pointer objects that
		 * reference types which are dependent upon type T.
		 */
		execDependentsSearch(hasaPointer: Pointer): Pointer[];
	}
	/**
	 * A graph of types, indexed by their URIs.
	 */
	export class TypeGraph {
		private readonly program;
		/** */
		constructor(program: Program);
		/** */
		private readonly roots;
	}
	/**
	 * Mines a Chart for bases. Produces a set of interconnected
	 * BaseInfo objects that represent the Supergraph.
	 */
	export class SuperLinkMiner {
		private readonly fragmenter;
		/** */
		constructor(fragmenter: Fragmenter);
		/** */
		mine(uri: Uri, hotPath?: Uri): SuperLink[] | null;
		/** */
		private doRecursiveDescendingLookup;
		/**
		 * Stores a map of previously mined typed,
		 * indexed by their associated Type URI.
		 */
		private readonly miningResults;
	}
	/**
	 * A class that links a URI to other URIs that store the base.
	 */
	export class SuperLink {
		/** */
		readonly from: Uri;
		/** */
		readonly to: ReadonlySet<Uri>;
	}
	/**
	 * 
	 */
	export class TargetedLookup {
		readonly cluster: Pointer;
		/** */
		constructor(cluster: Pointer);
	}
	/**
	 * 
	 */
	export class DescendingLookup {
		readonly discoveries: ReadonlyArray<TargetedLookup>;
		/** */
		constructor(discoveries: ReadonlyArray<TargetedLookup>);
	}
	/**
	 * 
	 */
	export class SiblingLookup {
		/** */
		readonly ancestry: ReadonlyArray<Pointer>;
		/** */
		readonly siblings: ReadonlyArray<Pointer>;
		constructor(
		/** */
		ancestry: ReadonlyArray<Pointer>,
		/** */
		siblings: ReadonlyArray<Pointer>);
	}
	/**
	 * Contains members that replicate the behavior of
	 * the language server.
	 */
	export namespace LanguageServer {
		/**
		 * Position in a text document expressed as zero-based line and character offset.
		 * The offsets are based on a UTF-16 string representation. So a string of the form
		 * `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀`
		 * is 1 and the character offset of b is 3 since `𐐀` is represented using two code
		 * units in UTF-16.
		 * 
		 * Positions are line end character agnostic. So you can not specify a position that
		 * denotes `\r|\n` or `\n|` where `|` represents the character offset.
		 */
		interface Position {
			/**
			 * Line position in a document (zero-based).
			 * If a line number is greater than the number of lines in a document, it defaults back to the number of lines in the document.
			 * If a line number is negative, it defaults to 0.
			 */
			line: number;
			/**
			 * Character offset on a line in a document (zero-based). Assuming that the line is
			 * represented as a string, the `character` value represents the gap between the
			 * `character` and `character + 1`.
			 * 
			 * If the character value is greater than the line length it defaults back to the
			 * line length.
			 * If a line number is negative, it defaults to 0.
			 */
			character: number;
		}
		/**
		 * The Position namespace provides helper functions to work with
		 * [Position](#Position) literals.
		 */
		namespace Position {
			/**
			 * Creates a new Position literal from the given line and character.
			 * @param line The position's line.
			 * @param character The position's character.
			 */
			function create(line: number, character: number): Position;
			/**
			 * Checks whether the given liternal conforms to the [Position](#Position) interface.
			 */
			function is(value: any): value is Position;
		}
		/**
		 * A range in a text document expressed as (zero-based) start and end positions.
		 * 
		 * If you want to specify a range that contains a line including the line ending
		 * character(s) then use an end position denoting the start of the next line.
		 * For example:
		 * ```ts
		 * {
		 *     start: { line: 5, character: 23 }
		 *     end : { line 6, character : 0 }
		 * }
		 * ```
		 */
		interface Range {
			/**
			 * The range's start position
			 */
			start: Position;
			/**
			 * The range's end position.
			 */
			end: Position;
		}
		/**
		 * A text edit applicable to a text document.
		 */
		interface TextEdit {
			/**
			 * The range of the text document to be manipulated. To insert
			 * text into a document create a range where start === end.
			 */
			range: Range;
			/**
			 * The string to be inserted. For delete operations use an
			 * empty string.
			 */
			newText: string;
		}
		/**
		 * The TextEdit namespace provides helper function to create replace,
		 * insert and delete edits more easily.
		 */
		namespace TextEdit {
		}
		/**
		 * Describes the content type that a client supports in various
		 * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
		 * 
		 * Please note that `MarkupKinds` must not start with a `$`. This kinds
		 * are reserved for internal usage.
		 */
		namespace MarkupKind {
		}
		type MarkupKind = 'plaintext' | 'markdown';
		/**
		 * A `MarkupContent` literal represents a string value which content is interpreted base on its
		 * kind flag. Currently the protocol supports `plaintext` and `markdown` as markup kinds.
		 * 
		 * If the kind is `markdown` then the value can contain fenced code blocks like in GitHub issues.
		 * See https://help.github.com/articles/creating-and-highlighting-code-blocks/#syntax-highlighting
		 * 
		 * Here is an example how such a string can be constructed using JavaScript / TypeScript:
		 * ```ts
		 * let markdown: MarkdownContent = {
		 *  kind: MarkupKind.Markdown,
		 *	value: [
		 *		'# Header',
		 *		'Some text',
		 *		'```typescript',
		 *		'someCode();',
		 *		'```'
		 *	].join('\n')
		 * };
		 * ```
		 * 
		 * *Please Note* that clients might sanitize the return markdown. A client could decide to
		 * remove HTML from the markdown to avoid script execution.
		 */
		interface MarkupContent {
			/**
			 * The type of the Markup
			 */
			kind: MarkupKind;
			/**
			 * The content itself
			 */
			value: string;
		}
		/**
		 * The kind of a completion entry.
		 */
		namespace CompletionItemKind {
			const Text = 1;
			const Method = 2;
			const Function = 3;
			const Constructor = 4;
			const Field = 5;
			const Variable = 6;
			const Class = 7;
			const Interface = 8;
			const Module = 9;
			const Property = 10;
			const Unit = 11;
			const Value = 12;
			const Enum = 13;
			const Keyword = 14;
			const Snippet = 15;
			const Color = 16;
			const File = 17;
			const Reference = 18;
			const Folder = 19;
			const EnumMember = 20;
			const Constant = 21;
			const Struct = 22;
			const Event = 23;
			const Operator = 24;
			const TypeParameter = 25;
		}
		type CompletionItemKind = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;
		/**
		 * Defines whether the insert text in a completion item should be interpreted as
		 * plain text or a snippet.
		 */
		namespace InsertTextFormat {
		}
		type InsertTextFormat = 1 | 2;
		/**
		 * A completion item represents a text snippet that is
		 * proposed to complete text that is being typed.
		 */
		interface CompletionItem {
			/**
			 * The label of this completion item. By default
			 * also the text that is inserted when selecting
			 * this completion.
			 */
			label: string;
			/**
			 * The kind of this completion item. Based of the kind
			 * an icon is chosen by the editor.
			 */
			kind?: CompletionItemKind;
			/**
			 * A human-readable string with additional information
			 * about this item, like type or symbol information.
			 */
			detail?: string;
			/**
			 * A human-readable string that represents a doc-comment.
			 */
			documentation?: string | MarkupContent;
			/**
			 * Indicates if this item is deprecated.
			 */
			deprecated?: boolean;
			/**
			 * A string that should be used when comparing this item
			 * with other items. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 */
			sortText?: string;
			/**
			 * A string that should be used when filtering a set of
			 * completion items. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 */
			filterText?: string;
			/**
			 * A string that should be inserted into a document when selecting
			 * this completion. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 * 
			 * The `insertText` is subject to interpretation by the client side.
			 * Some tools might not take the string literally. For example
			 * VS Code when code complete is requested in this example `con<cursor position>`
			 * and a completion item with an `insertText` of `console` is provided it
			 * will only insert `sole`. Therefore it is recommended to use `textEdit` instead
			 * since it avoids additional client side interpretation.
			 * 
			 * @deprecated Use textEdit instead.
			 */
			insertText?: string;
			/**
			 * The format of the insert text. The format applies to both the `insertText` property
			 * and the `newText` property of a provided `textEdit`.
			 */
			insertTextFormat?: InsertTextFormat;
			/**
			 * An [edit](#TextEdit) which is applied to a document when selecting
			 * this completion. When an edit is provided the value of
			 * [insertText](#CompletionItem.insertText) is ignored.
			 * 
			 * *Note:* The text edit's range must be a [single line] and it must contain the position
			 * at which completion has been requested.
			 */
			textEdit?: TextEdit;
			/**
			 * An optional array of additional [text edits](#TextEdit) that are applied when
			 * selecting this completion. Edits must not overlap (including the same insert position)
			 * with the main [edit](#CompletionItem.textEdit) nor with themselves.
			 * 
			 * Additional text edits should be used to change text unrelated to the current cursor position
			 * (for example adding an import statement at the top of the file if the completion item will
			 * insert an unqualified type).
			 */
			additionalTextEdits?: TextEdit[];
			/**
			 * An optional set of characters that when pressed while this completion is active will accept it first and
			 * then type that character. *Note* that all commit characters should have `length=1` and that superfluous
			 * characters will be ignored.
			 */
			commitCharacters?: string[];
			/**
			 * An data entry field that is preserved on a completion item between
			 * a [CompletionRequest](#CompletionRequest) and a [CompletionResolveRequest]
			 * (#CompletionResolveRequest)
			 */
			data?: any;
		}
		/**
		 * The CompletionItem namespace provides functions to deal with
		 * completion items.
		 */
		namespace CompletionItem {
		}
	}
}

declare module "truth-compiler" {
	/**
	 * The top-level object that manages Truth documents.
	 */
	export class Program {
		/** */
		constructor();
		/** */
		readonly hooks: HookTypesInstance;
		/** */
		readonly agents: Agents;
		/** */
		readonly documents: DocumentGraph;
		/** */
		readonly types: TypeGraph;
		/** */
		readonly faults: FaultService;
		/**
		 * Begin inspecting the specified document,
		 * starting with the types defined at it's root.
		 */
		inspect(document: Document): ProgramInspectionSite;
		/**
		 * 
		 */
		inspect(document: Document, line: number, offset: number): ProgramInspectionSite;
		/**
		 * 
		 */
		inspect(document: Document, statement: Statement): ProgramInspectionSite;
		/**
		 * 
		 */
		inspect(document: Document, pointer: Pointer): ProgramInspectionSite;
	}
	/**
	 * Defines an area in a particular document where Program
	 * inspection can begin.
	 */
	export class ProgramInspectionSite {
		/** */
		private readonly program;
		/** */
		private readonly document;
		/** */
		private readonly line;
		/** */
		private readonly offset;
		/** */
		private readonly area;
		/** */
		private readonly statement;
		/** */
		private readonly pointer;
		/** */
		private readonly typeConstructor;
		/**
		 * Gets the statement that is the parent of this
		 * ProgramInspectionPoint's statement object.
		 * 
		 * In the case when this statement is top level,
		 * a reference to the statement's containing
		 * document is returned.
		 * 
		 * In the case when the inspection point has
		 * no logical parent, such as if the statement
		 * is a comment, the returned value is null.
		 */
		readonly parent: Statement | Document | null;
		private _parent;
		/**
		 * Gets information about any declaration found at
		 * the document location specified in the constructor
		 * parameters of this object.
		 * 
		 * Gets null in the case when something other than
		 * a declaration is found at the location.
		 */
		readonly declaration: DeclarationSite | null;
		private _declaration;
		/**
		 * Get information about any annotation found at
		 * the document location specified in the constructor
		 * parameters of this object.
		 * 
		 * Gets null in the case when something other than
		 * an annotation is found at the location.
		 */
		readonly annotation: AnnotationSite | null;
		private _annotation;
	}
	/**
	 * A class that allows access to the underlying
	 * Types defined at the point of one single
	 * subject within a document.
	 */
	export class DeclarationSite {
		constructor(pointer: Pointer, typeConstructor: TypeConstructor);
		/** */
		readonly pointer: Pointer;
		/**
		 * Stores a reference to the TypeConstructor object
		 * used across the current frame.
		 */
		private readonly typeConstructor;
		/**
		 * Gets the array of types referenced at the declaration site.
		 * Multiple types may be related to a single declaration site
		 * in the case when it's contained by a statement with multiple
		 * declarations.
		 */
		readonly types: ReadonlyArray<Type>;
		private _types;
	}
	/**
	 * 
	 */
	export class AnnotationSite {
		constructor(pointer: Pointer);
		/** */
		readonly subject: Subject;
		/**
		 * Gets an array representing the declaration sites that
		 * sit to the left of this annotation site in the document.
		 */
		readonly adjacentDeclarations: ReadonlyArray<DeclarationSite>;
		private _adjacentDeclarations;
		/**
		 * Gets an array representing the declaration sites that
		 * sit to the left of this annotation site in the document.
		 */
		readonly matches: ReadonlyArray<Match>;
		private _matches;
		/** */
		private readonly pointer;
	}
	/**
	 * A cache that stores all agents loaded by the compiler.
	 */
	export class Agents {
		/**
		 * Constructs an agent from the specified file, or from
		 * a cache if the specified file has already been read.
		 * @returns A reference to the added agent.
		 */
		add(sourceUri: Uri | string): Promise<Agent | null>;
		/**
		 * Removes the agent from the system having the specified source file path.
		 * @returns A boolean indicating whether an agent was deleted.
		 */
		delete(sourceUri: Uri | string): boolean;
		/** Stores a map of agent build functions, indexed by their absolute URI. */
		private readonly buildFunctionCache;
		/** Stores a set of all agents added to the system. */
		private readonly agentCacheObject;
	}
	/** */
	export class Agent {
		/** Stores an array of documents that reference this Agent. */
		readonly referencingDocuments: Document[];
		/** Stores the absolute path to the JavaScript file that contains the agent source code. */
		readonly sourceUri: Uri;
		/** Store the built-in hooks, as well as the hooks specified in the document. */
		readonly hooks: HookTypesInstance;
	}
	/**
	 * 
	 */
	export abstract class HookType<TIn extends object | void = object, TOut extends object | void = void> {
		private readonly router;
		private readonly agent;
		/**
		 * Adds a hook contributor function that executes in
		 * response to the running of hooks of the containing type.
		 */
		contribute(fn: (hookIn: Readonly<TIn>) => TOut | void): void;
		/**
		 * Adds a hook capturer function that runs after the hook contributors
		 * have returned their results. Hook capturer functions are passed an
		 * array containing the produced results of all the contributor functions.
		 */
		capture(fn: (hookIn: Readonly<TIn>) => void): void;
		/**
		 * Runs all hook contributor functions whose constructor matches the
		 * containing hook type. Then, all matching hook capturer functions are
		 * called, passing the return values generated by the contributor functions.
		 * @param hook An instance of the Hook to run.
		 */
		run(hookIn: TIn): TOut[];
	}
	/**
	 * Stores all of the hook types used across the entire system.
	 */
	export namespace HookTypes {
		/** A hooks that runs immediate after a document has been created. */
		class DocumentCreated extends HookType<DocumentParam> {
		}
		/** A hooks that runs immediately before a document is removed from the program. */
		class DocumentDeleted extends HookType<DocumentParam> {
		}
		/** A hook that runs when a document's file name changes. */
		class DocumentRenamed extends HookType<DocumentRenameParam> {
		}
		/** A base class for a hook that is run during type resolution events. */
		class Resolution extends HookType<ResolutionParam, ResolutionResult> {
		}
		/** A hook that runs before the core is about to resolve a term. */
		class BeforeResolve extends HookTypes.Resolution {
		}
		/** A hook that runs after the core has resolved a term. */
		class AfterResolve extends HookTypes.Resolution {
		}
		/** A hook that runs when the core is unable to resolve a particular term. */
		class NotResolved extends HookTypes.Resolution {
		}
		/** A base class for a hook that performs editor navigations. */
		class Navigation extends HookType<NavigationParam> {
		}
		/** A hook that runs when a "Find References" operation has been requested. */
		class FindReferences extends HookTypes.Navigation {
		}
		/** A hook that runs when a "Find Fragments" operation has been requested. */
		class FindFragments extends HookTypes.Navigation {
		}
		/** A hook that runs when a "Find Declarations" operation has been requested. */
		class FindDeclarations extends HookTypes.Navigation {
		}
		/** A hook that runs when a quick fix operation is requested. Not implemented. */
		class Fix<TIn extends object> extends HookType<TIn> {
		}
		/** A hook that runs when checking whether a rename operation can be executed. */
		class CanRename extends HookType<CanParam, CanResult> {
		}
		/** A hook that runs when a rename operation should be executed. */
		class DoRename extends HookType<DoRenameParam> {
		}
		/** A hook that runs when a dialog should be displayed. Not implemented. */
		class Dialog extends HookType<void> {
		}
		/** A hook that runs when completion. */
		class Completion extends HookType<CompletionParam, CompletionResult> {
		}
		/** */
		class Invalidate extends HookType<InvalidateParam> {
		}
		/** */
		class Revalidate extends HookType<RevalidateParam> {
		}
		/**
		 * A hook that runs when a document edit transaction has completed.
		 */
		class EditComplete extends HookType<DocumentParam> {
		}
		/**
		 * A hook that runs when a URI reference is added to a document,
		 * but before it resolves to a resource.
		 */
		class UriReferenceAdded extends HookType<UriReferenceParam, UriReferenceResult> {
		}
		/**
		 * A hook that runs when a URI reference is removed from a document.
		 */
		class UriReferenceRemoved extends HookType<UriReferenceParam> {
		}
		/** A hook that runs when a fault has been detected in a document. */
		class FaultReported extends HookType<FaultParam> {
		}
		/** A hook that runs when a fault has been rectified, and should be eliminated. */
		class FaultRectified extends HookType<FaultParam> {
		}
	}
	/** */
	export class DocumentParam {
		readonly document: Document;
		constructor(document: Document);
	}
	/** Input parameters for documents being renamed. */
	export class DocumentRenameParam {
		readonly document: Document;
		readonly oldUri: Uri;
		constructor(document: Document, oldUri: Uri);
	}
	/**
	 * 
	 */
	export class InvalidateParam {
		/**
		 * A reference to the Document object in which the Invalidation occured.
		 */
		readonly document: Document;
		/**
		 * An array of statements whose descendants should be invalidated.
		 * If the array is empty, the entire document should be invalidated.
		 */
		readonly parents: ReadonlyArray<Statement>;
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		readonly indexes: ReadonlyArray<number>;
		constructor(
		/**
		 * A reference to the Document object in which the Invalidation occured.
		 */
		document: Document,
		/**
		 * An array of statements whose descendants should be invalidated.
		 * If the array is empty, the entire document should be invalidated.
		 */
		parents: ReadonlyArray<Statement>,
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		indexes: ReadonlyArray<number>);
	}
	/**
	 * 
	 */
	export class RevalidateParam {
		/**
		 * A reference to the Document object in which the Revalidation will occur.
		 */
		readonly document: Document;
		/**
		 * An array of statements whose descendants should be revalidated.
		 */
		readonly parents: ReadonlyArray<Statement>;
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		readonly indexes: ReadonlyArray<number>;
		constructor(
		/**
		 * A reference to the Document object in which the Revalidation will occur.
		 */
		document: Document,
		/**
		 * An array of statements whose descendants should be revalidated.
		 */
		parents: ReadonlyArray<Statement>,
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		indexes: ReadonlyArray<number>);
	}
	/**
	 * Generic class that stores the inputs of a "Can" hook.
	 * "Can" hooks are hooks where the system needs to perform
	 * a pre-flight check to see if the command can be run at
	 * a certain position within a document.
	 */
	export class CanParam {
		readonly document: Document;
		readonly pointer: Pointer;
		constructor(document: Document, pointer: Pointer);
	}
	/** Generic class that stores the output of a "Can" hook. */
	export class CanResult {
		readonly value: boolean;
		constructor(value: boolean);
	}
	/** Input parameters for resolution hooks */
	export class ResolutionParam {
		readonly program: Program;
		readonly spine: Spine;
		constructor(program: Program, spine: Spine);
	}
	/** Output for resolution hooks */
	export class ResolutionResult {
		resolves: boolean;
	}
	/** Input parameters for navigation hooks. */
	export class NavigationParam {
		readonly document: Document;
		readonly initiatingTerm: Subject;
		constructor(document: Document, initiatingTerm: Subject);
	}
	/** */
	export class DoRenameParam {
		readonly document: Document;
		readonly pointer: Pointer;
		constructor(document: Document, pointer: Pointer);
	}
	/** Input parameters for completion hooks. */
	export class CompletionParam {
		readonly document: Document;
		readonly line: number;
		readonly offset: number;
		constructor(document: Document, line: number, offset: number);
	}
	/** Output for completion hooks. */
	export class CompletionResult {
		readonly items: LanguageServer.CompletionItem[];
		constructor(items: LanguageServer.CompletionItem[]);
	}
	/** */
	export class FillParam {
		readonly document: Document;
		constructor(document: Document);
	}
	/** */
	export class UriReferenceParam {
		readonly document: Document;
		readonly statement: Statement;
		readonly uri: Uri;
		constructor(document: Document, statement: Statement, uri: Uri);
	}
	/** */
	export class UriReferenceResult {
		readonly accepted: boolean;
		constructor(accepted: boolean);
	}
	/** */
	export class DeclareParam {
		readonly program: Program;
		readonly spine: Spine;
		constructor(program: Program, spine: Spine);
	}
	/** */
	export class DeclareResult {
		/**
		 * Assignable value to ignore the declaration
		 * of the term attempting to be declared.
		 */
		readonly ignoreTerm: boolean;
		/**
		 * Assignable value to ignore the declaration
		 * of all terms on the has-a side of the statement.
		 */
		readonly ignoreHasaTerms: boolean;
		/**
		 * Assignable value to ignore the declaration
		 * of all terms on the is-a side of the statement.
		 */
		readonly ignoreIsaTerms: boolean;
		constructor(
		/**
		 * Assignable value to ignore the declaration
		 * of the term attempting to be declared.
		 */
		ignoreTerm: boolean,
		/**
		 * Assignable value to ignore the declaration
		 * of all terms on the has-a side of the statement.
		 */
		ignoreHasaTerms: boolean,
		/**
		 * Assignable value to ignore the declaration
		 * of all terms on the is-a side of the statement.
		 */
		ignoreIsaTerms: boolean);
	}
	/** */
	export class FaultParam {
		readonly document: Document;
		readonly fault: Fault;
		constructor(document: Document, fault: Fault);
	}
	/** Defines an instantatiated version of the HookTypes namespace. */
	export type HookTypesInstance = {
		[P in keyof typeof HookTypes]: Readonly<InstanceType<typeof HookTypes[P]>>;
	};
	/**
	 * 
	 */
	export class Document {
		/**
		 * Fills the document with the specified source code.
		 * If the document is non-empty, it is emptied before being filled.
		 * @param source The source text to fill the document.
		 */
		private fill;
		/**
		 * @returns An array of Statement objects that represent
		 * ancestry of the specified statement. If the specified
		 * statement is not in this document, the returned value
		 * is null.
		 */
		getAncestry(statement: Statement | number): Statement[] | null;
		/**
		 * @returns The parent Statement object of the specified
		 * Statement. If the statement is top level, a reference to
		 * this document object is returned. If the statement is
		 * not found in the document, or the specified statement
		 * is a no-op, the returned value is null.
		 */
		getParent(statement: Statement | number): this | Statement | null;
		/**
		 * @returns The Statement that would act as the parent
		 * if a statement where to be inserted at the specified
		 * virtual position in the document. If an inserted
		 * statement would be top-level, a reference to this
		 * document object is returned.
		 */
		getParentFromPosition(virtualLine: number, virtualOffset: number): Statement | this;
		/**
		 * @returns The sibling Statement objects of the
		 * specified Statement. If the specified statement
		 * is not found in the document, or is a no-op, the
		 * returned value is null.
		 */
		getSiblings(statement: Statement | number): Statement[] | null;
		/**
		 * @returns The child Statement objects of the specified
		 * Statement. If the argument is null or omitted, the document's
		 * top-level statements are returned. If the specified statement
		 * is not found in the document, the returned value is null.
		 */
		getChildren(statement?: Statement | null): Statement[];
		/**
		 * @returns A boolean value that indicates whether the specified
		 * statement, or the statement at the specified index has any
		 * descendants. If the argument is null, the returned value is a
		 * boolean indicating whether this document has any non-noop
		 * statements.
		 */
		hasDescendants(statement: Statement | number | null): boolean;
		/**
		 * @returns The index of the specified statement in
		 * the document, relying on caching when available.
		 * If the statement does not exist in the document,
		 * the returned value is -1.
		 */
		getStatementIndex(statement: Statement): number;
		/**
		 * @returns An array of strings containing the content
		 * written in the comments directly above the specified
		 * statement. Whitespace lines are ignored. If the specified
		 * statement is a no-op, an empty array is returned.
		 */
		getNotes(statement: Statement | number): string[];
		/**
		 * Enumerates through statements in the document,
		 * optionally including no-ops.
		 */
		eachStatement(includeNoops?: boolean): IterableIterator<{
			statement: Statement;
			position: number;
		}>;
		/**
		 * Reads the Statement at the given position.
		 * Negative numbers read Statement starting from the end of the document.
		 */
		read(line: number): Statement;
		/**
		 * Convenience method that converts a statement or it's index
		 * within this document to a statement object.
		 */
		private toStatement;
		/**
		 * Convenience method to quickly turn a value that may be
		 * a statement or a statement index, into a bounded statement
		 * index.
		 */
		private toIndex;
		/**
		 * Visits each statement that is a descendant of the specified
		 * statement. If the parameter is null or omitted, all statements
		 * in this Document are visited.
		 * 
		 * The method yields an object that contains the visited statement,
		 * as well as a numeric level value that specifies the difference in
		 * the number of nesting levels between the specified initialStatement
		 * and the visited statement.
		 * 
		 * @param initialStatement A reference to the statement object
		 * from where the enumeration should begin.
		 * 
		 * @param includeInitial A boolean value indicating whether or
		 * not the specified initialStatement should also be returned
		 * as an element in the enumeration. If true, initialStatement
		 * must be non-null.
		 */
		visitDescendants(initialStatement?: Statement | null, includeInitial?: boolean): IterableIterator<{
			level: number;
			statement: Statement;
		}>;
		/**
		 * Starts an edit transaction in the specified callback function.
		 * Edit transactions are used to synchronize changes made in
		 * an underlying file, typically done by a user in a text editing
		 * environment. System-initiated changes such as automated
		 * fixes, refactors, or renames do not go through this pathway.
		 * @param editFn The callback function in which to perform
		 * document mutation operations.
		 */
		edit(editFn: (facts: IDocumentMutator) => void): void;
		/** Stores the URI from where this document was loaded. */
		readonly sourceUri: Uri;
		/** A reference to the instance of the Compiler that owns this Document. */
		readonly program: Program;
		/**
		 * Stores the complete list of the Document's statements,
		 * sorted in the order that they appear in the file.
		 */
		private readonly statements;
		/**
		 * Shifts the cached statement indexes above the specified
		 * number, by the specified offset. Once the size of the cache
		 * grows past a certain threshold, the statement cache is cleared.
		 * Shifting the indexes of small caches is a simple optimization
		 * that allows the document to avoid throwing away the entire
		 * cache for many edits to the document.
		 */
		private shiftStatementIndexCache;
		/**
		 * Stores a cache of the indexes at which various statements
		 * are located in the statements array. Not all statements
		 * contained in the document are stored in this array. The
		 * cache is built up and cleared over time.
		 */
		private readonly statementIndexCache;
		/**
		 * A state variable that stores whether an
		 * edit transaction is currently underway.
		 */
		private inEdit;
		/**
		 * Returns a formatted version of the Document.
		 */
		toString(): string;
	}
	/**
	 * Represents an interface for creating a
	 * batch of document mutation operations.
	 */
	interface IDocumentMutator {
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
	 * A class that stores all the documents loaded into a
	 * program, and the inter-dependencies between them.
	 */
	export class DocumentGraph {
		/** */
		constructor(program: Program);
		/**
		 * Reads a Document from the specified URI.
		 * The document is created and returned, asynchronously.
		 */
		read(uri: Uri | string): Promise<Error | Document>;
		/**
		 * Creates a temporary document that will exist only in memory.
		 * The document may not be linked to other documents in the
		 * graph.
		 */
		create(): Document;
		/**
		 * Creates a temporary document that will exist only in memory,
		 * which is initialized with the specified source text. The document
		 * may not be linked to other documents in the graph.
		 */
		create(sourceText: string): Document;
		/**
		 * Creates a document that was read from the specified URI,
		 * with the specified sourceText. If the content still needs to be
		 * read from a URI, use the .read() method.
		 */
		create(uri: Uri | string, sourceText: string): Document;
		/**
		 * Blocks execution until all queued IO operations have completed.
		 */
		await(): Promise<void>;
		/**
		 * @returns The document loaded into this graph
		 * with the specified URI.
		 */
		get(uri: Uri | string): Document | null;
		/**
		 * @returns An array containing all documents
		 * loaded into this graph.
		 */
		getAll(): Document[];
		/**
		 * Deletes a document that was previously loaded into the compiler.
		 * Intended to be called by the host environment when a file changes.
		 */
		delete(target: Document | Uri | string): void;
		/**
		 * Removes all documents from this graph.
		 */
		clear(): void;
		/**
		 * @returns An array containing the dependencies
		 * associated with the specified document.
		 */
		getDependencies(doc: Document): Document[];
		/**
		 * @returns An array containing the dependents
		 * associated with the specified document.
		 */
		getDependents(doc: Document): Document[];
		/**
		 * Attempts to add a link from one document to another,
		 * via the specified URI. If there is some reason why the
		 * link cannot be established, (circular references, bad
		 * URIs), no link is added, and a fault is reported.
		 */
		private tryLink;
		/**
		 * An array of functions that should be executed when
		 * all outstanding async operations have completed.
		 */
		private waitFns;
		/**
		 * Counts the number of async operations in progress.
		 */
		private asyncCount;
		/**
		 * Checks to see if the addition of a reference between the two
		 * specified documents would result in a document graph with
		 * circular relationships.
		 * 
		 * The algorithm used performs a depth-first dependency search,
		 * starting at the candidateTo. If the traversal pattern is able to
		 * make its way to candidateFrom, it can be concluded that the
		 * addition of the proposed reference would result in a cyclical
		 * relationship.
		 */
		private wouldCreateCycles;
		/**
		 * Adds a dependency between two documents in the graph.
		 * If a dependency between the two documents already exists,
		 * the reference count of the dependency is incremented.
		 * This method is executed only after other methods have
		 * indicated that the addition of the link will not cause conflict.
		 */
		private link;
		/**
		 * Removes a dependency between two documents in the graph.
		 * If the reference count of the dependency is greater than 1, the
		 * the reference count is decremented instead of the dependency
		 * being removed completely.
		 */
		private unlink;
		/**
		 * A map of documents loaded into the graph,
		 * indexed by their URIs.
		 */
		private readonly documents;
		/**
		 * A map of each document's dependencies.
		 */
		private readonly dependencies;
		/**
		 * A map of the documents that depend on each document.
		 */
		private readonly dependents;
		/** */
		private readonly program;
		/**
		 * Converts the contents of this DocumentGraph to a
		 * string representation, useful for testing purposes.
		 */
		toString(): string;
	}
	/**
	 * 
	 */
	export class Statement {
		/** */
		constructor(document: Document, text: string);
		/** Gets whether the statement is a comment. */
		readonly isComment: boolean;
		/** Gets whether the statement contains no non-whitespace characters. */
		readonly isWhitespace: boolean;
		/** Gets whether the statement is a comment or whitespace. */
		readonly isNoop: boolean;
		/** Gets whether the statement has been removed from it's containing document. */
		readonly isDisposed: boolean;
		/** Stores a reference to the document that contains this statement. */
		readonly document: Document;
		/** Stores the indent level of the statement. */
		readonly indent: number;
		/** */
		readonly hasaSubjects: SubjectBoundaries;
		/** */
		readonly isaSubjects: SubjectBoundaries;
		/**
		 * Stores the position at which the joint operator exists
		 * in the statement. A negative number indicates that
		 * the joint operator does not exist in the statement.
		 */
		readonly jointPosition: number;
		/**
		 * Stores the unprocessed text content of the statement,
		 * as it appears in the document.
		 */
		readonly textContent: string;
		/**
		 * Returns contextual statement information relevant at
		 * the specified character offset. If a pointer exists at the
		 * specified, offset, it is included in the returned object.
		 */
		inspect(offset: number): {
			side: ReadonlyMap<number, Subject | null>;
			region: StatementRegion;
			pointer: Pointer | null;
		};
		/**
		 * Gets the kind of StatementArea that exists at the
		 * given character offset within the Statement.
		 */
		getAreaKind(offset: number): StatementAreaKind;
		/**
		 * @returns A pointer to the has-a subject at the specified offset,
		 * or null if there is no has-a subject at the specified offset.
		 */
		getDeclaration(offset: number): Pointer | null;
		/**
		 * @returns A pointer to the is-a subject at the specified offset,
		 * or null if there is no is-a subject at the specified offset.
		 */
		getAnnotation(offset: number): Pointer | null;
		/**
		 * Gets the set of pointers in that represent all declarations
		 * and annotations in this statement, from left to right.
		 */
		readonly subjects: Pointer[];
		/**
		 * Gets the set of pointers in that represent the
		 * declarations of this statement, from left to right.
		 */
		readonly declarations: Pointer[];
		private _declarations;
		/**
		 * Gets the set of pointers in that represent the
		 * annotations of this statement, from left to right.
		 */
		readonly annotations: Pointer[];
		private _annotations;
		/**
		 * @returns A string containing the inner comment text of
		 * this statement, excluding the comment syntax token.
		 * If the statement isn't a comment, null is returned.
		 */
		getCommentText(): string | null;
		/**
		 * Converts the statement to a formatted string representation.
		 */
		toString(includeIndent?: boolean): string;
	}
	/**
	 * Stores a map of the character offsets within a Statement
	 * that represent the starting positions of the statement's
	 * Subjects.
	 */
	export type SubjectBoundaries = ReadonlyMap<number, Subject | null>;
	/**
	 * Defines the areas of a statement that are significantly
	 * different when performing inspection.
	 */
	export enum StatementAreaKind {
		/** */
		void = 0,
		/** */
		whitespace = 1,
		/** */
		declaration = 2,
		/** */
		annotation = 3,
		/** */
		declarationVoid = 4,
		/** */
		annotationVoid = 5
	}
	enum StatementRegion {
		/**
		 * A region cannot be inferred from the statement, because it is a no-op.
		 */
		none = 0,
		/**
		 * The cursor is at left-most position on the line.
		 */
		preStatement = 1,
		/**
		 * The cursor is at the left-most position on the line,
		 * and whitespace characters are on the right.
		 * 
		 * Example:
		 * |...
		 */
		preIndent = 2,
		/**
		 * The cursor has indent-related whitespace characters
		 * on both it's left and right.
		 * 
		 * Example:
		 * ..|..subject : subject
		 */
		midIndent = 4,
		/**
		 * The cursor has zero or more whitespace characters on its left,
		 * and zero non-whitespace characters on its right.
		 * 
		 * Example:
		 * ...|
		 */
		postIndent = 8,
		/**
		 * The cursor is positioned direct before, directly after, or between
		 * the characters of a has-a subject.
		 * 
		 * Example:
		 * ...|subject : subject
		 */
		hasaWord = 16,
		/**
		 * The cursor has zero or more whitespace characters on it's left,
		 * preceeded by a comma, preceeded by a has-a subject, and either
		 * one or more whitespace characters to it's right, or the statement
		 * separator.
		 * 
		 * Example:
		 * subject| : subject
		 */
		postHasaWord = 32,
		/**
		 * The cursor has zero or more whitespace characters on it's left,
		 * which are preceeded by the statement separator.
		 * 
		 * Example:
		 * subject |: subject
		 */
		preJoint = 64,
		/**
		 * The cursor has zero or more whitespace characters on it's left,
		 * which are preceeded by the statement separator.
		 * 
		 * Example:
		 * subject :| subject
		 */
		postJoint = 128,
		/**
		 * The cursor is positioned direct before, directly after,
		 * or bettween the characters of an is-a subject.
		 * 
		 * Example:
		 * subject : subject|, subject
		 */
		isaWord = 256,
		/**
		 * The cursor has zero or more whitespace characters on it's left,
		 * preceeded by a comma, preceeded by an is-a subject, and either
		 * one or more whitespace characters to it's right, or the statement
		 * terminator.
		 * 
		 * Example:
		 * subject : subject,| subject
		 */
		postIsaWord = 512,
		/**
		 * The cursor is at the very last position of the line.
		 * 
		 * Example:
		 * subject : subject|
		 */
		postStatement = 1024
	}
	/**
	 * A class that represents a single subject in a Statement.
	 * Consumers of this class should not expect Subject objects
	 * to be long-lived, as they are discarded regularly after edit
	 * transactions complete.
	 */
	export class Subject {
		/** */
		constructor(text: string);
		/** */
		readonly name: string;
		/** */
		readonly pluralized: boolean;
		/**
		 * Stores the text of the URI when in the subject is
		 * formatted as such. When the subject does not
		 * form a URI, this field is an empty string.
		 */
		readonly uri: Uri | null;
		/** Calculates whether this Subject is structurally equal to another. */
		equals(other: Subject | string | null): boolean;
		/** Converts this Subject to it's string representation. */
		toString(): string;
	}
	/**
	 * A class that represents a position in a statement.
	 */
	export class Pointer {
		/** */
		constructor(statement: Statement, subject: Subject | null, atDeclaration: boolean, atAnnotation: boolean, offsetStart: number);
		/**
		 * Gets an array of statements that represent the statement
		 * containment progression, all the way back to the containing
		 * document.
		 */
		readonly ancestry: ReadonlyArray<Statement>;
		private _ancestry;
		/** Stores a reference to the Statement that contains this Pointer. */
		readonly statement: Statement;
		/**
		 * Stores either a reference to the instance of the Subject that this
		 * Pointer represents, or a unique string in the case when this is
		 * a "Thin Pointer" that represents an Invisible Subject.
		 */
		readonly subject: Subject | string;
		/** */
		readonly atDeclaration: boolean;
		/** */
		readonly atAnnotation: boolean;
		/**
		 * The offset in the statement that marks the start of the
		 * region being pointed to.
		 */
		readonly offsetStart: number;
		/**
		 * The offset in the statement that marks the end of the
		 * region being pointed to.
		 */
		readonly offsetEnd: number;
		/**
		 * Splits apart the groups subjects specified in the containing
		 * statement's ancestry, and generates a series of spines,
		 * each indicating a separate pathway of declarations through
		 * the ancestry that reach the location in the document
		 * referenced by this global pointer object.
		 * 
		 * The generated spines are referentially opaque. Running this
		 * method on the same Pointer object always returns the same
		 * Spine instance.
		 */
		factor(): ReadonlyArray<Spine>;
		/**  */
		private factoredSpines;
	}
	/**
	 * A class that manages an array of Pointer objects that
	 * represent a specific spine of declarations, starting at
	 * a document, passing through a series of pointers,
	 * and ending at a tip pointer.
	 */
	export class Spine {
		/** */
		constructor(nodes: Pointer[]);
		/** Stores the last pointer in the array of segments. */
		readonly tip: Pointer;
		/** */
		readonly statement: Statement;
		/** Gets a reference to the document that sits at the top of the spine. */
		readonly document: Document;
		/**  */
		readonly nodes: ReadonlyArray<Pointer>;
	}
	/**
	 * A class that defines a type defined within a scope.
	 * A type may be composed of multiple pointers across
	 * multiple localities, as represented by the .pointers
	 * field.
	 */
	export class Type {
		/**
		 * 
		 */
		constructor(pointers: ReadonlyArray<Pointer>);
		/** */
		readonly name: Subject;
		/** */
		readonly parentType: Type;
		/** Stores an array of Types that base this one. */
		readonly bases: ReadonlyArray<Type>;
		/**
		 * Stores an array of annotations which failed to resolve as bases,
		 * but were successfully resolved by regular expressions. The array is
		 * sorted in the order in which the annotations appear in the document.
		 */
		readonly matchables: ReadonlyArray<Match>;
		/** Stores an array of pointers to has-a side subjects that compose this Type. */
		readonly fragments: ReadonlyArray<Pointer>;
		/** */
		readonly isSpecified: boolean;
		/** */
		readonly isOverride: boolean;
		/** */
		readonly isIntroduction: boolean;
		/**
		 * The set of types that exist in supers that are equivalently
		 * named as the type that this TypeInfo object represents,
		 * that contribute to the construction of this type. If this
		 * Type is an introduction, the array is empty.
		 */
		readonly sources: ReadonlyArray<Type>;
		/** Gets the plurality status of the type. */
		readonly plurality: Plurality;
		private _plurality;
		/**
		 * Gets an array containing all child Types of this one, whether
		 * they're specified, unspecified, overriddes, or introductions.
		 */
		readonly childTypes: Type[];
		private _childTypes;
	}
	/**
	 * Stores the plurality status of a Type.
	 */
	export enum Plurality {
		/** Indicates that no plurality information is attached to the type. */
		none = 0,
		/** Indicates that the type, or one of it's supers, has been pluralized. */
		pluralized = 1,
		/** Indicates that the type has been singularized. */
		singularized = 2,
		/** Indicates a conflict in the type's supers about the plurality status. */
		erroneous = 3
	}
	/** */
	export class Match {
		readonly text: string;
		readonly bases: ReadonlyArray<Type>;
		constructor(text: string, bases: ReadonlyArray<Type>);
	}
	/**
	 * A class that carries out the type construction process.
	 */
	export class TypeConstructor {
		private readonly program;
		/** */
		constructor(program: Program);
		/** */
		exec(spine: Spine): Type;
		/** */
		private tryInference;
	}
	/** */
	export enum UriProtocol {
		none = 0,
		file = 1,
		https = 2,
		http = 3,
		internal = 4,
		unsupported = 5
	}
	/**
	 * A class that represents a Truth URI.
	 * A Truth URI can point to a truth file, or an agent through a variety of
	 * different protocols, just like a normal URI. However, a Truth URI that
	 * points to a Truth file can also point to declarations within that file
	 * directly in the URI, using the double slash syntax. For example:
	 * 
	 * //domain.com/File.truth//Path/To/Declaration
	 */
	export class Uri {
		/** */
		static create(uri: Uri | string, relativeTo?: Uri | Document | null): Uri | null;
		/** Creates a type URI from the specified Spine object. */
		static createFromSpine(spine: Spine): Uri;
		/** Creates a unique internal URI. */
		static createInternal(): Uri;
		/** */
		protected constructor(rawUri: string, relativeTo?: Uri | Document | null);
		/**
		 * Stores a reference to the protocol used by the URI.
		 */
		readonly protocol: UriProtocol;
		/**
		 * Stores the file name specified in the URI, if one exists.
		 */
		readonly fileName: string;
		/**
		 * Stores the base file name specified in the URI.
		 * For example, for the URI path/to/dir/file.ext, base would
		 * be the string "file". If the URI does not contain a file
		 * name, the field is an empty string.
		 */
		readonly fileNameBase: string;
		/**
		 * Stores the extension of the file specified in the URI,
		 * without the dot character. If the URI does not contain
		 * a file name, the field is an empty string.
		 */
		readonly fileExtension: string;
		/**
		 * Stores the fully qualified path to the file, and the file
		 * name itself, but without any protocol.
		 */
		readonly ioPath: string;
		/**
		 * Stores the contents of any type path specified in the URI.
		 */
		readonly typePath: ReadonlyArray<string>;
		/**
		 * Converts the URI to a fully-qualified path including the file name.
		 */
		toString(includeProtocol?: boolean, includeTypePath?: boolean): string;
		/**
		 * @returns A value indicating whether two URIs point to the same resource.
		 */
		equals(uri: Uri | string): boolean;
		/**
		 * @returns A copy of this Uri, but with mutable properties.
		 */
		toMutable(): {
			/** */
			ioPath: string;
			/** */
			typePath: ReadonlyArray<string>;
			/** Creates an immutable URI from this MutableUri object. */
			freeze(): Uri;
			/**
			 * Stores a reference to the protocol used by the URI.
			 */
			readonly protocol: UriProtocol;
			/**
			 * Stores the file name specified in the URI, if one exists.
			 */
			readonly fileName: string;
			/**
			 * Stores the base file name specified in the URI.
			 * For example, for the URI path/to/dir/file.ext, base would
			 * be the string "file". If the URI does not contain a file
			 * name, the field is an empty string.
			 */
			readonly fileNameBase: string;
			/**
			 * Stores the extension of the file specified in the URI,
			 * without the dot character. If the URI does not contain
			 * a file name, the field is an empty string.
			 */
			readonly fileExtension: string;
			/**
			 * Converts the URI to a fully-qualified path including the file name.
			 */
			toString(includeProtocol?: boolean | undefined, includeTypePath?: boolean | undefined): string;
			/**
			 * @returns A value indicating whether two URIs point to the same resource.
			 */
			equals(uri: string | Uri): boolean;
			toMutable(): any;
		};
	}
	/** */
	export class UriReader {
		/**
		 * Attempts to read the contents of the given URI.
		 * If an error is generated while trying to read a file
		 * at the specified location, the errors is returned.
		 */
		static tryRead(uri: Uri): Promise<string | Error>;
	}
	/**
	 * An enumeration that stores language syntax tokens.
	 */
	export const enum Syntax {
		tab = "\t",
		space = " ",
		terminal = "\n",
		combinator = ",",
		joint = ":",
		pluralizer = "...",
		regexDelimiter = "/",
		escapeChar = "\\",
		comment = "// ",
		truthExtension = "truth",
		agentExtension = "js"
	}
	/**
	 * A class that manages the diagnostics that have been
	 * reported for the current state of the program.
	 */
	export class FaultService {
		private readonly program;
		/** */
		constructor(program: Program);
		/**
		 * Reports a fault. If a similar Fault on the same area
		 * of the document hasn't been reported, the method
		 * runs the FaultReported hook.
		 */
		report(fault: Fault): void;
		/**
		 * Gets a number representing the number of
		 * unrectified faults retained by this FaultService.
		 */
		readonly count: number;
		/**
		 * @returns A boolean value indicating whether this
		 * FaultService retains a fault that is similar to the specified
		 * fault (meaning that it has the same code and source).
		 */
		has(similarFault: Fault): boolean;
		/**
		 * Enumerates through the unrectified faults retained
		 * by this FaultService.
		 */
		each(): IterableIterator<Fault>;
		/**
		 * Broadcasts all reports stored in activeContext,
		 * and creates a new activeContext.
		 */
		private broadcastReports;
		/** */
		private inEditTransaction;
		/**
		 * A rolling, mutable field that is used as the build target of the
		 * faults found in the current frame.
		 */
		private activeContext;
	}
	/** */
	export type FaultSource = Statement | Pointer;
	/** Base class for all faults. */
	export abstract class Fault {
		/** */
		readonly severity: FaultSeverity;
		/** A human-readable description of the fault. */
		readonly abstract message: string;
		/** An error code, useful for reference purposes, or display in a user interface. */
		readonly abstract code: number;
		/** The document object that caused the fault to be reported. */
		readonly abstract source: FaultSource;
	}
	/** Base class for faults that relate to a specific statement. */
	export abstract class StatementFault extends Fault {
		readonly source: Statement;
		constructor(source: Statement);
	}
	/** Base class for faults that relate to a specific pointer. */
	export abstract class PointerFault extends Fault {
		readonly source: Pointer;
		constructor(source: Pointer);
	}
	/** */
	export enum FaultSeverity {
		/** Reports an error. */
		error = 1,
		/** Reports a warning. */
		warning = 2
	}
	/** */
	export class UnresolvedResourceFault extends StatementFault {
		constructor(source: Statement, error?: Error);
		readonly code = 1000;
		readonly message = "URI points to a resource that could not be resolved.";
	}
	/** */
	export class CircularResourceReferenceFault extends StatementFault {
		readonly code = 1001;
		readonly message = "URI points to a resource that would cause a circular reference.";
	}
	/** */
	export class InsecureResourceReferenceFault extends StatementFault {
		readonly code = 1002;
		readonly message: string;
	}
	/** */
	export class UnresolvedAnnotationFault extends PointerFault {
		readonly code = 1101;
		readonly message = "Unresolved annotation.";
	}
	/** */
	export class CircularTypeDependencyFault extends PointerFault {
		readonly code = 1102;
		readonly message = "Circular type dependency detected.";
	}
	/** */
	export class NonCovariantAnnotationsFault extends StatementFault {
		readonly code = 1103;
		readonly severity = FaultSeverity.warning;
		readonly message = "Overridden types must explicitly expand the type as defined in the base.";
	}
	/** */
	export class AnonymousTypeOnPluralFault extends StatementFault {
		readonly code = 1200;
		readonly message = "Anonymous types cannot be defined on a plural.";
	}
	/** */
	export class DoubleSidedPluralFault extends StatementFault {
		readonly code = 1201;
		readonly message = "Pluralization cannot exist on both sides of a statement.";
	}
	/** */
	export class MultiplicatePluralizationFault extends StatementFault {
		readonly code = 1202;
		readonly message = "Cannot pluralize an already pluralized type.";
	}
	/** */
	export class InvalidPluralChildFault extends StatementFault {
		readonly code = 1203;
		readonly message = "The containing plural cannot contain children of this type.";
	}
	/** */
	export class DeclarationSingularizationFault extends StatementFault {
		readonly code = 1204;
		readonly message = "Singularization cannot exist on the left side of a statement.";
	}
	/** */
	export class ExpressionInvalidFault extends StatementFault {
		readonly code = 1300;
		readonly message = "Invalid Regular Expression.";
	}
	/** */
	export class ExpressionPossiblyMatchesEmptyFault extends StatementFault {
		readonly code = 1301;
		readonly message = "Regular expression could possibly match an empty list of characters.";
	}
	/** */
	export class ExpressionDoesNotMatchBasesFault extends StatementFault {
		readonly code = 1302;
		readonly message = "Regular Expression does not match it's base types.";
	}
	/** */
	export class ExpressionAliasingPluralFault extends StatementFault {
		readonly code = 1303;
		readonly message = "Regular Expressions cannot alias a plural.";
	}
	/** */
	export class NamedEntitiesInRepeatingPatternFault extends StatementFault {
		readonly code = 1304;
		readonly message = "Named entities cannot exist in a repeating pattern.";
	}
	/** */
	export class ExpressionDescendentsFault extends StatementFault {
		readonly code = 1305;
		readonly message = "Regular Expression statements cannot have descendant statements.";
	}
	/** */
	export class TabsAndSpacesFault extends StatementFault {
		readonly code = 2000;
		readonly message = "Statement indent contains a mixture of tabs and spaces.";
		readonly severity = FaultSeverity.warning;
	}
	/**
	 * 
	 */
	export class Fragmenter {
		private readonly program;
		/** */
		constructor(program: Program);
		/**
		 * Updates contents of the Fragmenter to include the
		 * contents of the specified document.
		 */
		private handleDocumentAdded;
		/**
		 * Updates contents of the Fragmenter to exclude the
		 * contents of the specified document.
		 */
		private handleDocumentRemoved;
		/**
		 * Performs a defragmentation query, starting at the
		 * specified URI.
		 * 
		 * @returns An array of Defragment objects that target all
		 * fragments of the type implied by specified pointer.
		 * @returns Null in the case when the pointer targets
		 * an unpopulated location.
		 */
		lookup(uri: Uri, returnType: typeof TargetedLookup): Pointer[] | null;
		lookup(spine: Spine, returnType: typeof TargetedLookup): Pointer[] | null;
		lookup(uri: Uri, returnType: typeof DescendingLookup): DescendingLookup | null;
		lookup(spine: Spine, returnType: typeof DescendingLookup): DescendingLookup;
		lookup(uri: Uri, returnType: typeof SiblingLookup): SiblingLookup | null;
		lookup(spine: Spine, returnType: typeof SiblingLookup): SiblingLookup;
		/**
		 * Stores the declarations of the specified statement, and
		 * all of the declarations in it's descendant statements in
		 * the internal caches.
		 * 
		 * The statement object specified in the storeTarget parameter
		 * is expected to not be stored in the internal caches.
		 */
		private storeStatement;
		/**
		 * Removes the fragments associated with the specified pointer
		 * from all internal caches.
		 */
		private unstorePointer;
		/** */
		private cacheFragment;
		/** */
		private uncacheFragment;
		/**
		 * A map used to quickly find the fragments associated with a pointer.
		 * A separate fragment will exist in the array value for every spine
		 * ending at the Pointer key. Naturally, Pointers that are directly
		 * contained by a Document will only ever have one item in it's
		 * associated fragment array.
		 * 
		 * Note that the fragments in the array value may be parented by
		 * different apexes (meaning Pointers or Documents).
		 * 
		 * Although provisions are taken to ensure entries in this map are
		 * all explicitly released, a WeakMap is used in this case instead of
		 * a traditional Map as a defense measure against unforeseen bugs
		 * resulting in memory leaks.
		 */
		private readonly fragmentFinder;
		/**
		 * A map of the Document objects loaded into the system,
		 * and the top-level fragment objects to which they map.
		 */
		private readonly documents;
		/**
		 * Converts the contents of the Fragmenter to a string
		 * representation, useful for testing purposes.
		 */
		toString(): string;
	}
	/**
	 * A class of methods that execute the vertification-supporting
	 * operations of the system.
	 */
	export class Operations {
		private readonly program;
		/**
		 * Collects all annotations that have been applied to the
		 * type referenced by the specified Pointer.
		 * 
		 * @returns An array of types representing the collected
		 * annotations, but with any redundant types pruned.
		 */
		execAnnotationCollection(declaration: Pointer): Subject[];
		/**
		 * 
		 */
		execFindSupergraphEquivalents(): void;
		/**
		 * 
		 */
		execFindAncestorEquivalents(): void;
		/**
		 * Attempts to infer the type associated with the
		 * specified declaration-side Pointer. Performs base
		 * type inference, falling back to ancestry type
		 * inference if base type inference fails.
		 * 
		 * @returns Null in the case when there are is-a side
		 * types defined on the type referenced by the
		 * specified Pointer, and the associated type is
		 * therefore explicit rather than inferrable.
		 */
		execInference(declaration: Pointer): null | undefined;
		/**
		 * Attempts to infer the bases that should be implicitly
		 * applied to the specified type, by searching for equivalently
		 * named types contained within the specified type's
		 * Supergraph.
		 * 
		 * @param origin The type on which to perform inference.
		 * It is expected to be unannotated.
		 * 
		 * @returns An array of types representing the inferred
		 * bases. In the case when the specified type has multiple
		 * supers, and two or more of these supers have a type
		 * whose name matches the specified type, but differ
		 * in their bases, multiple bases may be inferred and
		 * and included in the returned array. However, this only
		 * happens in the case when these bases cannot be
		 * pruned down to a single type.
		 * 
		 * If no bases could be inferred, an empty array is
		 * returned.
		 */
		execSupergraphInference(origin: Type): Type[] | null;
		/**
		 * A strategy for inference that occurs when the
		 * type is an unbased introduction. Operates by
		 * scanning up the ancestry to determine if there
		 * is a matching type.
		 * 
		 * Attempts to infer the bases that should be added
		 * applied to the specified type, by searching for the
		 * type's equivalents named types explicitly specified
		 * within the specified type's ancestry of scopes.
		 * 
		 * @param origin The type on which to perform
		 * inference. It is expected to be unannotated.
		 * 
		 * @returns A type object representing the inferred
		 */
		execAncestorInference(origin: Type): Type | null;
		/**
		 * Performs the Polymorphic Base Resolution (PTR)
		 * algorithm as defined by the specification.
		 * 
		 * @returns An array of types that found at
		 * 
		 * Base resolution occurs when trying to resolve the
		 * basings of a given type.
		 * 
		 * The result of this method is a either the fully computed
		 * base-tree, or a base-tree that is sufficiently constructed
		 * to the point where a guarantee can be made about the
		 * origins of the type referenced in the specified Pointer.
		 */
		execResolution(origin: Pointer): Type[];
		/**
		 * 
		 * Computes the set of types imposed by bases of
		 * containing types.
		 * 
		 * If the parent type is a plural, the contract is not computed
		 * in a way that has anything to do with equivalents. The
		 * algorithm simply looks at the bases defined by the
		 * parent type, and uses these types as the contract.
		 * 
		 * Computes the set of types with which a specified
		 * type T is expected to comply. The argument is a
		 * has-a side pointer that references the type T.
		 * If type T is being introduced (as opposed to being
		 * overridden) in the scope where hasaPointer is
		 * pointing, then T has an open contract, and
		 * null is returned.
		 */
		execFindExpectation(declaration: Pointer): Type;
		/**
		 * The plurality of a type is computed by traversing the
		 * type's supergraph and determining if all pathways
		 * leading back to all root bases involve crossing the
		 * path of a pluralized type. In the case when one or more
		 * of these pathways cross pluralized types, and one or
		 * more do not, an error is generated.
		 */
		execPluralityCheck(origin: Type): void;
		/**
		 * Executes a search for all terms that are visible
		 * at the specified location.
		 * 
		 * The argument
		 * 
		 * @returns ?
		 */
		execReusablesSearch(statement: Statement): void;
		/**
		 * Executes a search for all terms that are dependent
		 * upon a type T, referenced via the specified has-a
		 * side Pointer.
		 * 
		 * The search occurs across the scope in which the
		 * specified Pointer exists, and continues deeply into
		 * any scopes nested inside.
		 * 
		 * @returns An array containing Pointer objects that
		 * reference types which are dependent upon type T.
		 */
		execDependentsSearch(hasaPointer: Pointer): Pointer[];
	}
	/**
	 * A graph of types, indexed by their URIs.
	 */
	export class TypeGraph {
		private readonly program;
		/** */
		constructor(program: Program);
		/** */
		private readonly roots;
	}
	/**
	 * Mines a Chart for bases. Produces a set of interconnected
	 * BaseInfo objects that represent the Supergraph.
	 */
	export class SuperLinkMiner {
		private readonly fragmenter;
		/** */
		constructor(fragmenter: Fragmenter);
		/** */
		mine(uri: Uri, hotPath?: Uri): SuperLink[] | null;
		/** */
		private doRecursiveDescendingLookup;
		/**
		 * Stores a map of previously mined typed,
		 * indexed by their associated Type URI.
		 */
		private readonly miningResults;
	}
	/**
	 * A class that links a URI to other URIs that store the base.
	 */
	export class SuperLink {
		/** */
		readonly from: Uri;
		/** */
		readonly to: ReadonlySet<Uri>;
	}
	/**
	 * 
	 */
	export class TargetedLookup {
		readonly cluster: Pointer;
		/** */
		constructor(cluster: Pointer);
	}
	/**
	 * 
	 */
	export class DescendingLookup {
		readonly discoveries: ReadonlyArray<TargetedLookup>;
		/** */
		constructor(discoveries: ReadonlyArray<TargetedLookup>);
	}
	/**
	 * 
	 */
	export class SiblingLookup {
		/** */
		readonly ancestry: ReadonlyArray<Pointer>;
		/** */
		readonly siblings: ReadonlyArray<Pointer>;
		constructor(
		/** */
		ancestry: ReadonlyArray<Pointer>,
		/** */
		siblings: ReadonlyArray<Pointer>);
	}
	/**
	 * Contains members that replicate the behavior of
	 * the language server.
	 */
	export namespace LanguageServer {
		/**
		 * Position in a text document expressed as zero-based line and character offset.
		 * The offsets are based on a UTF-16 string representation. So a string of the form
		 * `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀`
		 * is 1 and the character offset of b is 3 since `𐐀` is represented using two code
		 * units in UTF-16.
		 * 
		 * Positions are line end character agnostic. So you can not specify a position that
		 * denotes `\r|\n` or `\n|` where `|` represents the character offset.
		 */
		interface Position {
			/**
			 * Line position in a document (zero-based).
			 * If a line number is greater than the number of lines in a document, it defaults back to the number of lines in the document.
			 * If a line number is negative, it defaults to 0.
			 */
			line: number;
			/**
			 * Character offset on a line in a document (zero-based). Assuming that the line is
			 * represented as a string, the `character` value represents the gap between the
			 * `character` and `character + 1`.
			 * 
			 * If the character value is greater than the line length it defaults back to the
			 * line length.
			 * If a line number is negative, it defaults to 0.
			 */
			character: number;
		}
		/**
		 * The Position namespace provides helper functions to work with
		 * [Position](#Position) literals.
		 */
		namespace Position {
			/**
			 * Creates a new Position literal from the given line and character.
			 * @param line The position's line.
			 * @param character The position's character.
			 */
			function create(line: number, character: number): Position;
			/**
			 * Checks whether the given liternal conforms to the [Position](#Position) interface.
			 */
			function is(value: any): value is Position;
		}
		/**
		 * A range in a text document expressed as (zero-based) start and end positions.
		 * 
		 * If you want to specify a range that contains a line including the line ending
		 * character(s) then use an end position denoting the start of the next line.
		 * For example:
		 * ```ts
		 * {
		 *     start: { line: 5, character: 23 }
		 *     end : { line 6, character : 0 }
		 * }
		 * ```
		 */
		interface Range {
			/**
			 * The range's start position
			 */
			start: Position;
			/**
			 * The range's end position.
			 */
			end: Position;
		}
		/**
		 * A text edit applicable to a text document.
		 */
		interface TextEdit {
			/**
			 * The range of the text document to be manipulated. To insert
			 * text into a document create a range where start === end.
			 */
			range: Range;
			/**
			 * The string to be inserted. For delete operations use an
			 * empty string.
			 */
			newText: string;
		}
		/**
		 * The TextEdit namespace provides helper function to create replace,
		 * insert and delete edits more easily.
		 */
		namespace TextEdit {
		}
		/**
		 * Describes the content type that a client supports in various
		 * result literals like `Hover`, `ParameterInfo` or `CompletionItem`.
		 * 
		 * Please note that `MarkupKinds` must not start with a `$`. This kinds
		 * are reserved for internal usage.
		 */
		namespace MarkupKind {
		}
		type MarkupKind = 'plaintext' | 'markdown';
		/**
		 * A `MarkupContent` literal represents a string value which content is interpreted base on its
		 * kind flag. Currently the protocol supports `plaintext` and `markdown` as markup kinds.
		 * 
		 * If the kind is `markdown` then the value can contain fenced code blocks like in GitHub issues.
		 * See https://help.github.com/articles/creating-and-highlighting-code-blocks/#syntax-highlighting
		 * 
		 * Here is an example how such a string can be constructed using JavaScript / TypeScript:
		 * ```ts
		 * let markdown: MarkdownContent = {
		 *  kind: MarkupKind.Markdown,
		 *	value: [
		 *		'# Header',
		 *		'Some text',
		 *		'```typescript',
		 *		'someCode();',
		 *		'```'
		 *	].join('\n')
		 * };
		 * ```
		 * 
		 * *Please Note* that clients might sanitize the return markdown. A client could decide to
		 * remove HTML from the markdown to avoid script execution.
		 */
		interface MarkupContent {
			/**
			 * The type of the Markup
			 */
			kind: MarkupKind;
			/**
			 * The content itself
			 */
			value: string;
		}
		/**
		 * The kind of a completion entry.
		 */
		namespace CompletionItemKind {
			const Text = 1;
			const Method = 2;
			const Function = 3;
			const Constructor = 4;
			const Field = 5;
			const Variable = 6;
			const Class = 7;
			const Interface = 8;
			const Module = 9;
			const Property = 10;
			const Unit = 11;
			const Value = 12;
			const Enum = 13;
			const Keyword = 14;
			const Snippet = 15;
			const Color = 16;
			const File = 17;
			const Reference = 18;
			const Folder = 19;
			const EnumMember = 20;
			const Constant = 21;
			const Struct = 22;
			const Event = 23;
			const Operator = 24;
			const TypeParameter = 25;
		}
		type CompletionItemKind = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;
		/**
		 * Defines whether the insert text in a completion item should be interpreted as
		 * plain text or a snippet.
		 */
		namespace InsertTextFormat {
		}
		type InsertTextFormat = 1 | 2;
		/**
		 * A completion item represents a text snippet that is
		 * proposed to complete text that is being typed.
		 */
		interface CompletionItem {
			/**
			 * The label of this completion item. By default
			 * also the text that is inserted when selecting
			 * this completion.
			 */
			label: string;
			/**
			 * The kind of this completion item. Based of the kind
			 * an icon is chosen by the editor.
			 */
			kind?: CompletionItemKind;
			/**
			 * A human-readable string with additional information
			 * about this item, like type or symbol information.
			 */
			detail?: string;
			/**
			 * A human-readable string that represents a doc-comment.
			 */
			documentation?: string | MarkupContent;
			/**
			 * Indicates if this item is deprecated.
			 */
			deprecated?: boolean;
			/**
			 * A string that should be used when comparing this item
			 * with other items. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 */
			sortText?: string;
			/**
			 * A string that should be used when filtering a set of
			 * completion items. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 */
			filterText?: string;
			/**
			 * A string that should be inserted into a document when selecting
			 * this completion. When `falsy` the [label](#CompletionItem.label)
			 * is used.
			 * 
			 * The `insertText` is subject to interpretation by the client side.
			 * Some tools might not take the string literally. For example
			 * VS Code when code complete is requested in this example `con<cursor position>`
			 * and a completion item with an `insertText` of `console` is provided it
			 * will only insert `sole`. Therefore it is recommended to use `textEdit` instead
			 * since it avoids additional client side interpretation.
			 * 
			 * @deprecated Use textEdit instead.
			 */
			insertText?: string;
			/**
			 * The format of the insert text. The format applies to both the `insertText` property
			 * and the `newText` property of a provided `textEdit`.
			 */
			insertTextFormat?: InsertTextFormat;
			/**
			 * An [edit](#TextEdit) which is applied to a document when selecting
			 * this completion. When an edit is provided the value of
			 * [insertText](#CompletionItem.insertText) is ignored.
			 * 
			 * *Note:* The text edit's range must be a [single line] and it must contain the position
			 * at which completion has been requested.
			 */
			textEdit?: TextEdit;
			/**
			 * An optional array of additional [text edits](#TextEdit) that are applied when
			 * selecting this completion. Edits must not overlap (including the same insert position)
			 * with the main [edit](#CompletionItem.textEdit) nor with themselves.
			 * 
			 * Additional text edits should be used to change text unrelated to the current cursor position
			 * (for example adding an import statement at the top of the file if the completion item will
			 * insert an unqualified type).
			 */
			additionalTextEdits?: TextEdit[];
			/**
			 * An optional set of characters that when pressed while this completion is active will accept it first and
			 * then type that character. *Note* that all commit characters should have `length=1` and that superfluous
			 * characters will be ignored.
			 */
			commitCharacters?: string[];
			/**
			 * An data entry field that is preserved on a completion item between
			 * a [CompletionRequest](#CompletionRequest) and a [CompletionResolveRequest]
			 * (#CompletionResolveRequest)
			 */
			data?: any;
		}
		/**
		 * The CompletionItem namespace provides functions to deal with
		 * completion items.
		 */
		namespace CompletionItem {
		}
	}
}


declare const Hooks: Truth.HookTypesInstance;
declare const Program: Truth.Program;
