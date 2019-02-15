import * as X from "../X";


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
	export class DocumentUriChanged extends X.HookType<DocumentUriChangedParam> { }
	
	/** A base class for a hook that is run during type resolution events. */
	export class Resolution extends X.HookType<ResolutionParam, ResolutionResult> { }
	
	/** A hook that runs before the core is about to resolve a term. */
	export class BeforeResolve extends HookTypes.Resolution { }
	
	/** A hook that runs after the core has resolved a term. */
	export class AfterResolve extends HookTypes.Resolution { }
	
	/** A hook that runs when the core is unable to resolve a particular term. */
	export class NotResolved extends HookTypes.Resolution { }
	
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
	
	/**
	 * A hook that runs when the set of faults that are detected
	 * within the document have changed.
	 */
	export class FaultsChanged extends X.HookType<FaultParam> { }
}


/** */
export class DocumentParam
{
	constructor(readonly document: X.Document) { }
}


/** */
export class DocumentUriChangedParam
{
	constructor(
		readonly document: X.Document,
		readonly newUri: X.Uri)
	{ }
}


/** */
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


/** */
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


/** Output for resolution hooks */
export class ResolutionResult
{
	resolves = false;
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


/** Input parameters for resolution hooks */
export class ResolutionParam
{
	constructor(
		readonly program: X.Program,
		readonly spine: X.Spine)
	{ }
}


/** */
export class FaultParam
{
	constructor(
		readonly faultsAdded: X.Fault[],
		readonly faultsRemoved: X.Fault[])
	{ }
}
