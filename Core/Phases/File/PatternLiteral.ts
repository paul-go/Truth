import * as X from "./X";


/**
 * A class that stores an unparsed Pattern,
 * contained directly by a Statement.
 */
export class PatternLiteral
{
	/**
	 * @internal
	 * Logical clock value used to make chronological 
	 * creation-time comparisons between PatternLiterals.
	 */
	readonly stamp = X.VersionStamp.next();
	
	/** @internal */
	constructor(
		
		/**
		 * Stores the statement that contains this
		 * PatternLiteral.
		 */
		readonly statement: X.Statement,
		
		/** 
		 * Stores the offset at which the pattern literal
		 * ends in the containing statement.
		 */
		readonly offsetStart: number,
		
		/**
		 * Stores the offset at which the pattern literal
		 * ends in the containing statement.
		 */
		readonly offsetEnd: number,
		
		/**
		 * Gets whether the pattern literal specifies the
		 * coexistence (trailing comma) flag, which allows 
		 * aliases to exist within the annotation set of
		 * other non-aliases.
		 */
		readonly hasCoexistenceFlag: boolean,
		
		/**
		 * 
		 */
		readonly value: string = "")
	{ }
}
