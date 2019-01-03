import * as X from "../X";


/**
 * A type that describes the possible objects within a document
 * that may be responsible for the generation of a fault.
 */
export type TFaultSource = X.Statement | X.Span | X.InfixSpan;


/**
 * 
 */
export class Fault<TSource = TFaultSource>
{
	constructor(
		/** */
		readonly type: FaultType<TSource>,
		
		/** The document object that caused the fault to be reported. */
		readonly source: TSource)
	{ }
}


/**
 * 
 */
export class FaultType<TSource = TFaultSource>
{
	constructor(
		/**
		 * An error code, useful for reference purposes, or display in a user interface.
		 */
		readonly code: number,
		/**
		 * A human-readable description of the fault.
		 */
		readonly message: string,
		/**
		 * 
		 */
		readonly severity: FaultSeverity)
	{ }
	
	/**
	 * Creates a fault of this type.
	 */
	create(source: TSource)
	{
		return new Fault<TSource>(this, source);
	}
}


/**
 * 
 */
export const enum FaultSeverity
{
	/**
	 * Indicates the severity of a fault is "error", which means that
	 * the associated object will be ignored during type analysis.
	 */
	error = 1,
	/**
	 * Indicates the severity of a fault is "warning", which means that
	 * the associated object will still be processed during type analysis.
	 */
	warning = 2
}


/**
 * Utility function for creating frozen fault instances.
 */
function createFault<T>(
	code: number,
	message: string,
	severity = FaultSeverity.error)
{
	return Object.freeze(new FaultType<T>(code, message, severity));
}

const quantifiers = 
	`(${X.RegexSyntaxMisc.star}, 
	${X.RegexSyntaxMisc.plus},
	${X.RegexSyntaxDelimiter.quantifierStart}..${X.RegexSyntaxDelimiter.quantifierEnd})`

/**
 * 
 */
export const Faults = Object.freeze({
	
	/** */
	*each()
	{
		const values = <FaultType<object>[]>Object.values(Faults);
		
		for (const faultType of values)
			if (faultType instanceof FaultType)
				yield faultType;
	},
	
	/**
	 * @returns An object containing the FaultType instance
	 * associated with the fault with the specified code, as
	 * well as the name of the instance. In the case when the
	 * faultCode was not found, null is returned.
	 */
	nameOf(faultCode: number)
	{
		const entries = <[string, FaultType<object>][]>Object.entries(Faults);
		
		for (const [name, type] of entries)
			if (type instanceof FaultType)
				if (type.code === faultCode)
					return name;
		
		return "";
	},
	
	/** */
	UnresolvedResource: createFault<X.Statement>(
		100,
		"URI points to a resource that could not be resolved."),
	
	
	//
	// Resource-related faults
	//
	
	
	/** */
	CircularResourceReference: createFault<X.Statement>(
		102,
		"URI points to a resource that would cause a circular reference."),

	/** */
	InsecureResourceReference: createFault<X.Statement>(
		104,
		"Documents loaded from remote locations " +
		"cannot reference documents stored locally."),
	
	
	//
	// Type verification faults
	//
	
	
	/** */
	UnresolvedAnnotationFault: createFault<X.Span>(
		201,
		"Unresolved annotation."),
	
	/** */
	CircularTypeReference: createFault<X.Span>(
		203,
		"Circular type reference detected."),
	
	/** */
	ContractViolation: createFault<X.Span>(
		204,
		"Overridden types must explicitly expand the type as defined in the base."),
	
	/** */
	TypeCannotBeRefreshed: createFault<X.Statement>(
		206,
		"This type cannot be refreshed, because one or more base types are " +
		"imposing a specific type contract on it. Consider omitting the " + 
		X.Syntax.joint + " operator here.",
		FaultSeverity.warning),
	
	
	//
	// List-related faults
	//
	
	
	/** */
	AnonymousInListIntrinsicType: createFault<X.Statement>(
		300,
		"Types contained directly by List-intrinsic types cannot be anonymous."),
	
	/** */
	ListContractViolation: createFault<X.Span>(
		301,
		"The containing list cannot contain children of this type.",
		FaultSeverity.warning),
	
	/** */
	ListIntrinsicExtendingList: createFault<X.Span>(
		303,
		"List intrinsic types cannot extend from other lists."),
	
	/** */
	ListExtrinsicExtendingNonList: createFault<X.Span>(
		305,
		"Lists cannot extend from non-lists."),
	
	
	//
	// Parsing Faults
	//
	
	
	/** */
	UnterminatedCharacterSet: createFault<X.Statement>(
		0,
		`Unterminated character set. Pattern has an opening "${X.RegexSyntaxDelimiter.setStart}"
		character without a matching "${X.RegexSyntaxDelimiter.setEnd}" character.`),
	
	/** */
	UnterminatedGroup: createFault<X.Statement>(
		0,
		`Unterminated group. Pattern has an opening "${X.RegexSyntaxDelimiter.groupStart}"
		character without a matching "${X.RegexSyntaxDelimiter.groupEnd}" character.`),
	
	/** */
	DuplicateQuantifier: createFault<X.Statement>(
		0,
		`Multiple consecutive quantifiers ${quantifiers} are not allowed.`),
	
	/** */
	UnterminatedInfix: createFault<X.Statement>(
		0,
		`Unterminated infix. Pattern has an opening ${X.InfixSyntax.start},
		${X.InfixSyntax.nominalStart}, ${X.InfixSyntax.patternStart} delimiter without
		a matching closing delimiter.`),
	
	/** */
	EmptyPattern: createFault<X.Statement>(
		0,
		`Pattern has no matchable content.`),
	
	
	//
	// Pre-analysis faults
	//
	
	
	
	
	//
	// Pattern-related faults
	//
	
	
	/** */
	PatternInvalid: createFault<X.Statement>(
		400,
		"Invalid pattern."),
	
	/** */
	PatternWithoutAnnotation: createFault<X.Statement>(
		402,
		"Pattern has no annotations.",
		FaultSeverity.warning),
	
	/** */
	PatternCanMatchEmpty: createFault<X.Statement>(
		404,
		"Patterns must not be able to match an empty input."),
	
	/** */
	PatternCanMatchWhitespaceOnly: createFault<X.Statement>(
		420,
		"Patterns must not be able to match an input " +
		"containing only whitespace characters."),
	
	/** */
	PatternAcceptsLeadingWhitespace: createFault<X.Statement>(
		434,
		"Patterns must not be able to match an input " +
		"containing only whitespace characters."),
	
	/** */
	PatternRequiresLeadingWhitespace: createFault<X.Statement>(
		436,
		"Patterns must not be able to match an input " +
		"containing only whitespace characters."),
	
	/** */
	PatternAcceptsTrailingWhitespace: createFault<X.Statement>(
		438,
		"Patterns must not be able to match an input " +
		"containing only whitespace characters."),
	
	/** */
	PatternRequiresTrailingWhitespace: createFault<X.Statement>(
		440,
		"Patterns must not be able to match an input " +
		"containing only whitespace characters."),
	
	/** */
	PatternNonCovariant: createFault<X.Statement>(
		406,
		"Pattern does not match it's base types."),
	
	/** */
	PatternUnknownNestedTypes: createFault<X.Span>(
		432,
		"The base specified on the containing pattern has no type with this name."),
	
	/** */
	PatternIncompatible: createFault<X.Statement>(
		442,
		"This pattern is incompatible with other patterns that match the specified types."),
	
	/** */
	PatternPartialWithCombinator: createFault<X.Statement>(
		444,
		"Partial patterns cannot explicitly match the comma character."),
	
	/** */
	InfixHasQuantifier: createFault<X.Statement>(
		0,
		`Infixes cannot have quantifiers ${quantifiers} applied to them`),
	
	/** */
	InfixHasDuplicateIdentifier: createFault<X.InfixSpan>(
		0,
		`Infixes cannot have duplicate identifiers.`),
	
	/**  */
	InfixSelfReferential: createFault<X.InfixSpan>(
		410,
		"Infixes cannot be self-referential."),
	
	/**  */
	InfixNonConvariant: createFault<X.InfixSpan>(
		412,
		"Infixes must be compatible with their bases."),
	
	/** */
	InfixNotDefined: createFault<X.InfixSpan>(
		422,
		"Infixes must be defined on at least one of their matched bases."),
	
	/** */
	InfixTypeReferenceMustHavePattern: createFault<X.InfixSpan>(
		414,
		"Types referenced in an infix must have at least one associated pattern."),
	
	/** */
	InfixRecursive: createFault<X.InfixSpan>(
		416,
		"Recursive types cannot be referenced within infixes."),
	
	/** */
	InfixContractViolation: createFault<X.InfixSpan>(
		424,
		"Infix type annotations must explicitly expand the type as defined by the base."),
	
	/** */
	InfixPopulationChaining: createFault<X.InfixSpan>(
		426,
		"Population infixes cannot have multiple declarations."),
	
	/** */
	InfixUsingListOperator: createFault<X.InfixSpan>(
		0,
		`Infix identifiers cannot end with the list operator (${X.Syntax.list}).`),
	
	/** */
	InfixReferencingList: createFault<X.InfixSpan>(
		428,
		"Infixes cannot reference list types."),
	
	/** */
	PortabilityInfixHasMultipleDefinitions: createFault<X.InfixSpan>(
		418,
		"Portability infixes with compatible types cannot be specified more than once."),
	
	/** */
	PopulationInfixHasMultipleDefinitions: createFault<X.InfixSpan>(
		0,
		`Declarartions in a population infix cannot be defined twice in the same pattern`),
	
	/** */
	NominalInfixMustSubtype: createFault<X.Span>(
		430,
		"Patterns with nominal infixes require an input that is " +
		"a subtype of the type specified, not the type itself."),
	
	/** */
	DiscrepantUnion: createFault<X.Span>(
		450,
		"A union cannot be created between these types because their " + 
		"associated patterns conflict with each other."),
	
	
	//
	// Parse errors
	//
	
	
	/** */
	StatementBeginsWithComma: createFault<X.Statement>(
		500,
		"Statements cannot begin with a comma."),
	
	/** */
	StatementBeginsWithEllipsis: createFault<X.Statement>(
		502,
		"Statements cannot begin with an ellipsis (...)."),
	
	/** */
	StatementBeginsWithEscapedSpace: createFault<X.Statement>(
		504,
		"Statements cannot begin with an escape character (\\) " + 
		"that is followed by a tab or space."),
	
	
	//
	// Warnings
	//
	
	
	/** */
	TabsAndSpaces: createFault<X.Statement>(
		1000,
		"Statement indent contains a mixture of tabs and spaces.",
		FaultSeverity.warning),
	
	/** */
	DuplicateDeclaration: createFault<X.Span>(
		1001,
		"Duplicated declaration."),
	
	/** */
	IgnoredAnnotation: createFault<X.Span>(
		1003,
		"This annotation is ignored because another annotation " +
		"in this statement resolves to the same type."),
	
	/** */
	IgnoredAlias: createFault<X.Span>(
		1005,
		"Aliases (meaning annotations that are matched by patterns) " +
		"can't be added onto types that have a contract put in place " +
		"by a base type."),
});


// Additional safety
Array.from(Faults.each()).every(Object.freeze);
