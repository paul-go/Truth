
namespace Truth
{
	/**
	 * Represents an interface for creating a
	 * batch of document mutation operations.
	 */
	export interface IDocumentMutator
	{
		/**
		 * Inserts a statement at the given position, and returns the inserted Statement
		 * object. Negative numbers insert statements starting from the end of the
		 * document. The statementText argument is expected to be one single line of text.
		 */
		insert(statementText: string, at: number): void;
		
		/**
		 * Replaces a statement at the given position, and returns the replaced
		 * Statement object. Negative numbers insert statements starting from
		 * the end of the document. The statementText argument is expected to
		 * be one single line of text.
		 */
		update(statementText: string, at: number): void;
		
		/** 
		 * Deletes a statement at the given position, and returns the deleted
		 * Statement object. Negative numbers delete Statement objects
		 * starting from the end of the document.
		 */
		delete(at: number, count?: number): void;
	}
	
	/**
	 * 
	 */
	export interface IDocumentEdit
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
		 * Stores the 1-based line number on which the range starts.
		 */
		readonly startLineNumber: number;
		
		/**
		 * Stores the 1-based column on which the range starts in line
		 * `startLineNumber`.
		 */
		readonly startColumn: number;
		
		/**
		 * Stores the 1-based line number on which the range ends.
		 */
		readonly endLineNumber: number;
		
		/**
		 * Stores the 1-based column on which the range ends in line
		 * `endLineNumber`.
		 */
		readonly endColumn: number;
	}
	
	/** @internal */
	export class InsertCall 
	{
		constructor(readonly smt: Statement, readonly at: number) { }
	}
	
	/** @internal */
	export class UpdateCall
	{
		constructor(readonly smt: Statement, readonly at: number) { }
	}
	
	/** @internal */
	export class DeleteCall
	{
		constructor(readonly at: number, readonly count: number) { }
	}
	
	/** @internal */
	export type TCallType = InsertCall | UpdateCall | DeleteCall;
	
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
	 * An alias for a tuple used to construct faults that are used by a Document's
	 * .hasFaults method in order to check for the existence of a particular fault.
	 * 
	 * The schema of the tuple is [Fault type, line number
	 * 
	 * In the case when the fault type is an InfixSpan, 
	 */
	export type TComparisonFault = 
		[StatementFaultType, number] | 
		[SpanFaultType, number, number];
}
