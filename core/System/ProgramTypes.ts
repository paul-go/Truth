
namespace Truth
{
	/**
	 * Options object passed to the Program constructor.
	 */
	export interface IProgramOptions
	{
		/**
		 * A boolean value that indicates whether or
		 */
		autoVerify?: boolean;
	}
	
	/**
	 * An enumeration that refers to the stages of a Program's verification cycle.
	 */
	export const enum VerificationStage
	{
		/**
		 * Refers to the stage before verification has not begin, but where the
		 * containing program has unverified information.
		 */
		none = 0,
		/**
		 * Refers to the stage where no verification has completed, 
		 * but a verification process has launched.
		 */
		started = 1,
		/**
		 * Refers to the stage where the areas of the program that were
		 * explicitly modified via a call to Program.edit() have been verified.
		 */
		marked = 2,
		/**
		 * Refers to the stage where the areas of the program that were
		 * possibly affected by an edit have been verified. 
		 */
		affected = 3,
		/**
		 * Refers to the final stage where the areas of the program that
		 * could not have been affected by an edit have been verified.
		 */
		included = 4
	}
	
	/**
	 * Represents an interface for creating a batch of mutation operations,
	 * that may apply to any document within a program.
	 */
	export interface IProgramMutator
	{
		/**
		 * Inserts a statement at the given position, and returns the inserted Statement
		 * object.
		 * 
		 * @param document A reference to the document in which to insert a statement.
		 * @param statementText The text content of the statement, expected to be a single
		 * line of text.
		 * @param at The 1-based position in the document at which to insert the statement.
		 * Negative numbers insert statements starting from the end of the document. If the
		 * argument is omitted, the statement is appended at the end of the document.
		 */
		insert(document: Document, statementText: string, at?: number): void;
		
		/**
		 * Replaces a statement at the given position, and returns the replaced
		 * Statement object. 
		 * 
		 * @param document A reference to the document in which to update a statement.
		 * @param statementText The text content of the statement, expected to be a single
		 * line of text.
		 * @param at The 1-based position in the document of the statement to update.
		 * Negative numbers insert statements starting from the end of the document. If the
		 * argument is omitted, the statement is appended at the end of the document.
		 */
		update(document: Document, statementText: string, at?: number): void;
		
		/** 
		 * Deletes a statement at the given position, and returns the deleted
		 * Statement object.
		 * 
		 * @param document A reference to the document in which to update a statement.
		 * @param at The 1-based position in the document of the statement to update.
		 * Negative numbers insert statements starting from the end of the document. If the
		 * argument is omitted, the statement is appended at the end of the document.
		 * @param count The number of statements to remove from the document at the
		 * location specified in the `at` argument. If the argument is omitted, the value is
		 * assumed to be 1.
		 */
		delete(document: Document, at?: number, count?: number): void;
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
	
	/**
	 * @internal
	 * A class used by the mutation system to represent an insert 
	 * of a line within a document.
	 */
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
	
	/**
	 * @internal
	 * A class used by the mutation system to represent an update
	 * to a line within a document.
	 */
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
	
	/**
	 * @internal
	 * A class used by the mutation system to represent a deletion
	 * of a line within a document.
	 */
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
