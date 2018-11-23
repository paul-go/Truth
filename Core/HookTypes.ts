import * as X from "./X";


/**
 * Stores all of the hook types used across the entire system.
 */
export namespace HookTypes
{
	/** A hooks that runs immediate after a document has been created. */
	export class DocumentCreated extends X.HookType<DocumentParam> { }
	
	/** A hooks that runs immediately before a document is removed from the program. */
	export class DocumentDeleted extends X.HookType<DocumentParam> { }
	
	/** A hook that runs when a document's file name changes. */
	export class DocumentRenamed extends X.HookType<DocumentRenameParam> { }
	
	/** A base class for a hook that is run during type resolution events. */
	export class Resolution extends X.HookType<ResolutionParam, ResolutionResult> { }
	
	/** A hook that runs before the core is about to resolve a term. */
	export class BeforeResolve extends HookTypes.Resolution { }
	
	/** A hook that runs after the core has resolved a term. */
	export class AfterResolve extends HookTypes.Resolution { }
	
	/** A hook that runs when the core is unable to resolve a particular term. */
	export class NotResolved extends HookTypes.Resolution { }
	
	
	/** A base class for a hook that performs editor navigations. */
	export class Navigation extends X.HookType<NavigationParam> { }
	
	/** A hook that runs when a "Find References" operation has been requested. */
	export class FindReferences extends HookTypes.Navigation { }
	
	/** A hook that runs when a "Find Fragments" operation has been requested. */
	export class FindFragments extends HookTypes.Navigation { }
	
	/** A hook that runs when a "Find Declarations" operation has been requested. */
	export class FindDeclarations extends HookTypes.Navigation { }
	
	
	/** A hook that runs when a quick fix operation is requested. Not implemented. */
	export class Fix<TIn extends object> extends X.HookType<TIn> { }
	
	
	/** A hook that runs when checking whether a rename operation can be executed. */
	export class CanRename extends X.HookType<CanParam, CanResult> { }
	
	/** A hook that runs when a rename operation should be executed. */
	export class DoRename extends X.HookType<DoRenameParam> { }
	
	
	/** A hook that runs when a dialog should be displayed. Not implemented. */
	export class Dialog extends X.HookType<void> { }
	
	/** A hook that runs when completion. */
	export class Completion extends X.HookType<CompletionParam, CompletionResult> { }
	
	
	/** */
	export class Invalidate extends X.HookType<InvalidateParam> { }
	
	/** */
	export class Revalidate extends X.HookType<RevalidateParam> { }
	
	/**
	 * A hook that runs when a document edit transaction has completed.
	 */
	export class EditComplete extends X.HookType<DocumentParam> { }
	
	/**
	 * A hook that runs when a URI reference is added to a document, 
	 * but before it resolves to a resource.
	 */
	export class UriReferenceAdded extends X.HookType<UriReferenceParam, UriReferenceResult> { }
	
	/**
	 * A hook that runs when a URI reference is removed from a document.
	 */
	export class UriReferenceRemoved extends X.HookType<UriReferenceParam> { }
	
	/** A hook that runs when a fault has been detected in a document. */
	export class FaultReported extends X.HookType<FaultParam> { }
	
	/** A hook that runs when a fault has been rectified, and should be eliminated. */
	export class FaultRectified extends X.HookType<FaultParam> { }
}


/** */
export class DocumentParam
{
	constructor(readonly document: X.Document) { }
}


/** Input parameters for documents being renamed. */
export class DocumentRenameParam
{
	constructor(
		readonly document: X.Document,
		readonly oldUri: X.Uri)
	{ }
}


/**
 * 
 */
export class InvalidateParam
{
	constructor(
		/**
		 * A reference to the Document object in which the Invalidation occured.
		 */
		readonly document: X.Document,
		/**
		 * An array of statements whose descendants should be invalidated.
		 * If the array is empty, the entire document should be invalidated.
		 */
		readonly parents: ReadonlyArray<X.Statement>,
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		readonly indexes: ReadonlyArray<number>)
	{ }
}


/**
 * 
 */
export class RevalidateParam
{
	constructor(
		/**
		 * A reference to the Document object in which the Revalidation will occur.
		 */
		readonly document: X.Document,
		/**
		 * An array of statements whose descendants should be revalidated.
		 */
		readonly parents: ReadonlyArray<X.Statement>,
		/**
		 * An array of indexes whose length is the same as the parents field,
		 * that represents the index of each parent within the document.
		 */
		readonly indexes: ReadonlyArray<number>)
	{ }
}


/**
 * Generic class that stores the inputs of a "Can" hook. 
 * "Can" hooks are hooks where the system needs to perform
 * a pre-flight check to see if the command can be run at 
 * a certain position within a document.
 */
export class CanParam
{
	constructor(
		readonly document: X.Document,
		readonly pointer: X.Pointer)
	{ }
}


/** Generic class that stores the output of a "Can" hook. */
export class CanResult
{
	constructor(readonly value: boolean) { }
}


/** Input parameters for resolution hooks */
export class ResolutionParam
{
	constructor(
		readonly program: X.Program,
		readonly spine: X.Spine)
	{ }
}

/** Output for resolution hooks */
export class ResolutionResult
{
	resolves = false;
}

/** Input parameters for navigation hooks. */
export class NavigationParam
{
	constructor(
		readonly document: X.Document,
		readonly initiatingTerm: X.Subject)
	{ }
}

/** */
export class DoRenameParam
{
	constructor(
		readonly document: X.Document,
		readonly pointer: X.Pointer)
	{ }
}

/** Input parameters for completion hooks. */
export class CompletionParam
{
	constructor(
		readonly document: X.Document,
		readonly line: number,
		readonly offset: number)
	{ }
}

/** Output for completion hooks. */
export class CompletionResult
{
	constructor(readonly items: X.LanguageServer.CompletionItem[]) { }
}

/** */
export class FillParam
{
	constructor(
		readonly document: X.Document)
	{ }
}

/** */
export class UriReferenceParam
{
	constructor(
		readonly document: X.Document,
		readonly statement: X.Statement,
		readonly uri: X.Uri)
	{ }
}

/** */
export class UriReferenceResult
{
	constructor(readonly accepted: boolean) { }
}


/** */
export class FaultParam
{
	constructor(
		readonly document: X.Document,
		readonly fault: X.Fault)
	{ }
}
