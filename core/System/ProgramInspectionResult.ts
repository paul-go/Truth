
namespace Truth
{
	/**
	 * Stores the details about a precise location in a Document.
	 */
	export class ProgramInspectionResult
	{
		/** @internal */
		constructor(
			/**
			 * Stores the location of the inspection point within a Document.
			 */
			readonly position: Position,
			
			/**
			 * Stores the zone of the statement found at the specified location.
			 */
			readonly zone: StatementZone,
			
			/**
			 * Stores the compilation object that most closely represents
			 * what was found at the specified location. Stores null in the
			 * case when the specified location contains an object that
			 * has been marked as cruft (the statement and span fields
			 * are still populated in this case).
			 */
			readonly foundObject: Document | Type[] | null,
			
			/**
			 * Stores the Statement found at the specified location.
			 */
			readonly statement: Statement,
			
			/**
			 * Stores the Span found at the specified location, or
			 * null in the case when no Span was found, such as if
			 * the specified location is whitespace or a comment.
			 */
			readonly span: Span | null = null)
		{
			if (Array.isArray(foundObject) && foundObject.length === 0)
				this.foundObject = null;
		}
	}
	
	/**
	 * Marks a specific line and offset within a Truth document.
	 */
	export interface Position 
	{
		/** Represents a 1-based line number. */
		line: number;
		
		/** Represents a 1-based charcter offset. */
		offset: number;
	}
}
