
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
	 * A type that describes a Statement object with a non-null .uri value.
	 */
	export type UriStatement = Statement & { readonly uri: Uri; };
	
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
}
