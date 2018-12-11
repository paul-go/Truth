import * as X from "../../X";


/**
 * 
 */
export class Pattern
{
	/** */
	constructor()
	{
		// Perform Pattern construction code in here.
	}
	
	/** */
	readonly compiledExpression: RegExp = null!;
	
	/**
	 * @internal
	 * Provides a convenient way to access the infixes stored
	 * within the AST, without doing a deep traversal.
	 */
	readonly infixes: ReadonlyArray<Infix> = [];
	
	/** */
	readonly ast: Object = {};
	
	/**
	 * Stores a boolean value indicating whether the pattern
	 * can match individual blocks of content on the annotation
	 * side of a statement (separated by commas), or whether
	 * the pattern must match all annotation-side content in a
	 * statement.
	 */
	readonly canCoexist = false;
	
	/** Necessary? */
	readonly canMatchEmpty = false;
	
	/** Necessary? */
	readonly canMatchWhitespace = false;
}


/**
 * 
 */
export enum PatternComparisonResult
{
	/** */
	subset,
	
	/** */
	superset,
	
	/** */
	equal,
	
	/** */
	unequal
}


/**
 * @internal
 */
abstract class Infix
{
	/** */
	abstract readonly faults: ReadonlyArray<X.Fault>;
	
	/**
	 * Stores ALL infix spans ... even the ones that didn't resolve.
	 * For population infixes, the first span lines up with the identifier
	 * on the left side of the :, whereas the following spans line up with
	 * the identifiers after the :
	 */
	abstract readonly spans: ReadonlyArray<InfixSpan>;
}


/**
 * @internal
 */
abstract class PortabilityInfix extends Infix
{
	/**
	 * Stores an array of types with which this infix
	 * establishes portability.
	 */
	abstract readonly bases: ReadonlyArray<X.Type>;
}


/**
 * @internal
 */
abstract class PopulationInfix extends Infix
{
	/**
	 * Stores a reference to the type that will end up
	 * as a parameter in the type referencing the 
	 * containing pattern.
	 * (Rewording needed)
	 */
	abstract readonly mapping: X.Type;
	
	/**
	 * Stores a list of additional types that whould be
	 * applied to the type at the match site.
	 */
	abstract readonly additionalBases: ReadonlyArray<X.Type>;
	
	/**
	 * Stores whether the <<Double>> angle bracket
	 * syntax was used to only match named types,
	 * rather than aliases.
	 */
	abstract readonly forcesNominal: boolean;
	
	/**
	 * Computed value that determines whether
	 * the associated types have patterns, and is
	 * therefore operating in "pattern mode".
	 * If Forces is true, this is also true.
	 */
	abstract readonly usesNominal: boolean;
}


/**
 * @internal
 */
abstract class PatternInfix extends Infix
{
	/** */
	abstract readonly patternSource: X.Type | null;
}


/**
 * @internal
 * 
 * A class that represents a portion of the content 
 * within a pattern infix that spans a type reference.
 * 
 * Not compatible with the "Span" object used across
 * the rest of the system.
 */
class InfixSpan
{
	constructor(
		readonly statementOffsetStart: number,
		readonly statementOffsetEnd: number,
		readonly infixOffsetStart: number,
		readonly infixOffsetEnd: number,
		readonly text: string)
	{ }
}


/**
 * 
 */
export abstract class Alias
{
	/** */
	abstract readonly span: X.Span;
	
	/**
	 * Stores an array of Patterns that match this alias.
	 */
	abstract readonly recognizers: ReadonlyArray<Pattern>;
}


//
// Rough sketch of how the pattern AST
// is going to be structured.
//

class PatternNode { }
class PatternNodeExact extends PatternNode { }
class PatternNodeDot extends PatternNode { }
class PatternNodeCharset extends PatternNode { }
class PatternNodeChoice extends PatternNode { }
class PatternNodeEmpty extends PatternNode { }
class PatternNodeGroup extends PatternNode { }
class PatternNodeAssert extends PatternNode { }
class PatternNodeInfix extends PatternNode { }
