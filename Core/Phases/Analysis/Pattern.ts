import * as X from "./X";


//
// Temporary shim classes to support the coming regular expression functionality.
//


/**
 * A class that represents an instance of a
 * regular expression declaration.
 * 
 * (Does this need to be a Pattern AST?)
 */
export class Pattern
{
	/** */
	readonly literal = "";
	
	/** */
	readonly container: X.Type = null!;
	
	/** */
	readonly createsAliasFor: X.Type[] = [];
	
	/** An array containing the Patterns that this one extends. */
	readonly supers: X.Pattern[] = [];
	
	/** An array containing the Patterns that extend this one. */
	readonly subs: X.Pattern[] = [];
}


/**
 * A class that represents a 
 */
export class Alias
{
	/** */
	readonly pattern: Pattern = null!;
	
	/** */
	readonly content: string = "";
}
