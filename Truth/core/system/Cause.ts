
namespace Truth
{
	/**
	 * Abstract base class for all Causes defined both within
	 * the compiler core, and in user code.
	 */
	export abstract class Cause<R = void>
	{
		/**
		 * Stores the return type of the Cause, if any. In a cause callback function,
		 * this property exists as an array of objects that have been returned
		 * from other cause aids.
		 */
		readonly returns: R = null!;
	}
	
	/**
	 * Extracts the *Result* type parameter of a Cause.
	 */
	export type TCauseReturn<T> = T extends { returns: infer R } ? R : never;
	
	/**
	 * Maps a Cause type over to it's corresponding object
	 * that is fed into all cause callback functions.
	 */
	export type TCauseData<T> = {
		[P in keyof T]: P extends "returns" ?
			readonly T[P][] : 
			T[P];
	};
	
	// 
	// Causes
	// 
	
	/** */
	export class CauseAgentAttach extends Cause
	{
		constructor(
			/**
			 * Stores the URI from where the agent was loaded.
			 */
			readonly uri: KnownUri,
			/**
			 * Stores an object that represents the scope of where the agent
			 * applies.
			 * 
			 * If the value is `instanceof Program`, this indicates that
			 * the agent's causes are scoped to a particular program (which
			 * is effectively "unscoped").
			 * 
			 * If the value is `instanceof Document`, this indicates that
			 * the agent's causes are scoped to the causes that can
			 * originate from a single document.
			 * 
			 * (Not implemented). If the value is `instanceof Type`, this 
			 * indicates that the agent's causes are scoped to the causes
			 * that can originate from a single type.
			 */
			readonly scope: Program | Document | Type)
		{ super(); }
	}
	
	/** */
	export class CauseAgentDetach extends Cause
	{
		constructor(readonly uri: KnownUri) { super(); }
	}
	
	/** A cause that runs immediately after a document has been created. */
	export class CauseDocumentCreate extends Cause
	{
		constructor(readonly document: Document) { super(); }
	}
	
	/** A cause that runs immediately before a document is removed from the program. */
	export class CauseDocumentDelete extends Cause
	{
		constructor(readonly document: Document) { super(); }
	}
	
	/** A cause that runs when a document's file name changes. */
	export class CauseDocumentUriChange extends Cause
	{
		constructor(
			readonly document: Document,
			readonly newUri: KnownUri)
		{ super(); }
	}
	
	/** Abstract cause class for the resolution causes */
	export abstract class CauseResolve extends Cause<IResolutionReturn>
	{
		constructor(
			readonly program: Program,
			readonly spine: Spine)
		{ super(); }
	}
	
	/** Output for resolution hooks */
	export interface IResolutionReturn
	{
		readonly resolves: boolean;
	}
	
	/** A cause that runs before the compiler is about to resolve a term. */
	export class CauseBeforeResolve extends CauseResolve { }
	
	/** A cause that runs after the compiler has resolved a term. */
	export class CauseAfterResolve extends CauseResolve { }
	
	/** A cause that runs when the compiler is unable to resolve a term. */
	export class CauseNotResolved extends CauseResolve { }
	
	/** */
	export class CauseInvalidate extends Cause
	{
		constructor(
			/**
			 * A reference to the Document object in which the Invalidation occured.
			 */
			readonly document: Document,
			/**
			 * An array of statements whose descendants should be invalidated.
			 * If the array is empty, the entire document should be invalidated.
			 */
			readonly parents: readonly Statement[],
			/**
			 * An array of indexes whose length is the same as the parents field,
			 * that represents the index of each parent within the document.
			 */
			readonly indexes: readonly number[])
		{ super(); }
	}
	
	/** */
	export class CauseRevalidate extends Cause
	{
		constructor(
			/**
			 * A reference to the Document object in which the Revalidation will occur.
			 */
			readonly document: Document,
			/**
			 * An array of statements whose descendants should be revalidated.
			 */
			readonly parents: readonly Statement[],
			/**
			 * An array of indexes whose length is the same as the parents field,
			 * that represents the index of each parent within the document.
			 */
			readonly indexes: readonly number[])
		{ super(); }
	}
	
	/** A cause that runs when a document edit transaction has completed. */
	export class CauseEditComplete extends Cause
	{
		constructor(readonly document: Document) { super(); }
	}
	
	/** */
	export abstract class CauseUriReference extends Cause
	{
		constructor(
			/**
			 * A reference to the Statement instance that references
			 * this URI, or null in the case when the program itself
			 * references the URI by another means.
			 */
			readonly statement: Statement | null,
			readonly uri: KnownUri)
		{ super(); }
	}
	
	/**
	 * A hook that runs when a URI reference is added to a document, 
	 * but before it resolves to a resource.
	 */
	export class CauseUriReferenceAdd extends CauseUriReference { }
	
	/**
	 * A hook that runs when a URI reference is removed from a document.
	 */
	export class CauseUriReferenceRemove extends CauseUriReference { }
	
	/**
	 * A hook that runs when the set of faults that are detected
	 * within the document have changed.
	 */
	export class CauseFaultChange extends Cause
	{
		constructor(
			readonly faultsAdded: Fault[],
			readonly faultsRemoved: Fault[])
		{ super(); }
	}
}
