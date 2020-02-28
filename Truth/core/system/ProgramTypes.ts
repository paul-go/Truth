
namespace Truth
{
	/**
	 * Represents an interface for creating a batch of mutation operations,
	 * that may apply to any document within a program.
	 */
	export interface IProgramMutator
	{
		/**
		 * Inserts a statement at the given position, and returns the inserted Statement
		 * object. Negative numbers insert statements starting from the end of the
		 * document. The statementText argument is expected to be one single line of text.
		 */
		insert(document: Document, statementText: string, at: number): void;
		
		/**
		 * Replaces a statement at the given position, and returns the replaced
		 * Statement object. Negative numbers insert statements starting from
		 * the end of the document. The statementText argument is expected to
		 * be one single line of text.
		 */
		update(document: Document, statementText: string, at: number): void;
		
		/** 
		 * Deletes a statement at the given position, and returns the deleted
		 * Statement object. Negative numbers delete Statement objects
		 * starting from the end of the document.
		 */
		delete(document: Document, at: number, count?: number): void;
	}
	
	/**
	 * Represents an interface for creating a batch of mutation operations,
	 * that apply to single document within a program.
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
	 * An interface that represents an edit to a particular document
	 * loaded into a program.
	 */
	export interface IProgramEdit
	{
		/**
		 * Stores a reference to the Document being edited.
		 */
		readonly document: Document;
		
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
	 * An interface that represents an edit to a document.
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
		 * Stores the 0-based column on which the range starts in line
		 * `startLineNumber`.
		 */
		readonly startColumn: number;
		
		/**
		 * Stores the 1-based line number on which the range ends.
		 */
		readonly endLineNumber: number;
		
		/**
		 * Stores the 0-based column on which the range ends in line
		 * `endLineNumber`.
		 */
		readonly endColumn: number;
	}
	
	/** @internal */
	export class InsertEdit
	{
		constructor(
			readonly smt: Statement,
			readonly pos: number)
		{
			this.document = smt.document;
		}
		
		readonly document: Document;
	}
	
	/** @internal */
	export class UpdateEdit
	{
		constructor(
			readonly smt: Statement,
			readonly pos: number)
		{
			this.document = smt.document;
		}
		
		readonly document: Document;
	}
	
	/** @internal */
	export class DeleteEdit
	{
		constructor(
			readonly document: Document,
			readonly pos: number,
			readonly count: number)
		{ }
	}
	
	/** @internal */
	export type TEdit = InsertEdit | UpdateEdit | DeleteEdit;
}
