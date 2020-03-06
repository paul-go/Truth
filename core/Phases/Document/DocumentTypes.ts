
namespace Truth
{
	/**
	 * An alias for a tuple used to construct faults that are used by a Document's
	 * .hasFaults method in order to check for the existence of a particular fault.
	 * 
	 * TODO: How does this structure handle the case when the fault type is an 
	 * InfixSpan?
	 */
	export type TComparisonFault = 
		[StatementFaultType, number] | 
		[SpanFaultType, number, number];
	
	/**
	 * @internal
	 * A type that describes a Statement object with a non-null .uri field.
	 */
	export type UriStatement = Statement & { readonly uri: KnownUri; };
	
	/**
	 * @internal
	 * A class that stores information about a reference established by
	 * one document (via a Statement) to another document.
	 */
	export class Reference extends AbstractClass
	{
		constructor(
			readonly statement: UriStatement,
			readonly target: Document | null)
		{
			super();
		}
		
		/** @internal */
		readonly class = Class.reference;
	}
	
	/**
	 * @internal
	 */
	export interface IDocumentMutationTask
	{
		deletePhrases(): void;
		updateDocument(): void;
		createPhrases(): void;
		finalize(): Promise<void>;
	}
}
