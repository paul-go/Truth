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
		readonly source: TSource,
		
		/**
		 * A human-readable message that contains more in-depth detail
		 * of the fault that occured, in addition to the standard message.
		 */
		readonly additionalDetail: string = "")
	{
		const src = this.source;
		
		// The +1's are necessary in order to deal with the fact that
		// most editors are 1-based whereas the internal representation
		// of statement strings are 0-based.
		const range =
			src instanceof X.Statement ?
				[src.indent + 1, -1] :
			src instanceof X.InfixSpan || src instanceof X.Span ? 
				[src.boundary.offsetStart + 1, src.boundary.offsetEnd + 1] :
			[-1, -1];
		
		this.range = range.filter(n => n >= 0);
	}
	
	/**
	 * Converts this fault into a string representation,
	 * suitable for output as an error message.
	 */
	toString()
	{
		const doc = this.document;
		
		const avoidProtocols = [
			X.UriProtocol.internal,
			X.UriProtocol.none,
			X.UriProtocol.unknown
		];
		
		const uriText = avoidProtocols.includes(doc.sourceUri.protocol) ?
			"" : doc.sourceUri.toStoreString() + " ";
		
		const colNums = this.range.join("-");
		const colText = colNums ? ", Col " + colNums : "";
		
		return `${this.type.message} (${uriText}Line ${this.line}${colText})`;
	}
	
	/**
	 * Gets a reference to the Document in which this Fault was detected.
	 */
	get document()
	{
		return this.statement.document;
	}
	
	/**
	 * Gets a reference to the Statement in which this Fault was detected.
	 */
	get statement()
	{
		const src = this.source;
		return X.Guard.notNull(
			src instanceof X.Statement ? src :
			src instanceof X.Span ? src.statement :
			src instanceof X.InfixSpan ? src.statement :
			null);
	}
	
	/**
	 * Gets the line number of the Statement in which this Fault was detected.
	 */
	get line()
	{
		const smt = this.statement;
		return smt.document.getLineNumber(smt) + 1;
	}
	
	/**
	 * Gets an array representing the starting and ending character offsets
	 * within the Statement in which this Fault was detected.
	 */
	readonly range: number[];
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
	{
		this.message = message.trim().replace(/\s\s+/g, " ");
	}
	
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
	
	
	//
	// Resource-related faults
	//
	
	
	/** */
	UnresolvedResource: createFault<X.Statement>(
		100,
		"URI points to a resource that could not be resolved."),
	
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
	UnresolvedAnnotation: createFault<X.Span>(
		201,
		"Unresolved annotation."),
	
	/** */
	CircularTypeReference: createFault<X.Span>(
		203,
		"Circular type reference detected."),
	
	/** */
	ContractViolation: createFault<X.Statement>(
		// CHANGE THIS TO 204
		205,
		"Overridden types must explicitly expand the type as defined in the base."),
	
	/** */
	TypeCannotBeRefreshed: createFault<X.Statement>(
		206,
		`This type cannot be refreshed, because one or more base
		types are imposing a specific type contract on it. Consider
		omitting the ${X.Syntax.joint} operator here.`,
		FaultSeverity.warning),
	
	/** */
	IgnoredAnnotation: createFault<X.Span>(
		207,
		`This annotation is ignored because another annotation
		in this statement resolves to the same type.`),
	
	/** */
	IgnoredAlias: createFault<X.Span>(
		209,
		`Aliases (meaning annotations that are matched by patterns)
		can't be added onto types that have a contract put in place
		by a base type.`),
	
	/** */
	TypeSelfReferential: createFault<X.Span>(
		211,
		`Types cannot be self-referential`),
	
	
	//
	// List-related faults
	//
	
	
	/** */
	AnonymousInListIntrinsic: createFault<X.Statement>(
		300,
		"Types contained directly by List-intrinsic types cannot be anonymous.",
		X.FaultSeverity.warning),
	
	/** */
	ListContractViolation: createFault<X.Span>(
		301,
		"The containing list cannot contain children of this type.",
		FaultSeverity.warning),
	
	/** */
	ListIntrinsicExtendingList: createFault<X.Span>(
		303,
		"List intrinsic types cannot extend from other lists."),
	
	/** (This is the same thing as a list dimensionality conflict) */
	ListExtrinsicExtendingNonList: createFault<X.Span>(
		305,
		"Lists cannot extend from non-lists."),
	
	/** */
	ListDimensionalDiscrepancyFault: createFault<X.Span>(
		307,
		`A union cannot be created between these two types
		because they are lists of different dimensions.`),
	
	/** */
	ListAnnotationConflict: createFault<X.Span>(
		309,
		`All fragments of this annotation need to have
		a list operator (${X.Syntax.list})`),
	
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
	PatternMatchingTypesAlreadyExists: createFault<X.Statement>(
		406,
		`A pattern matching these types has 
		already been defined in this scope.`),
	
	/** */
	PatternMatchingList: createFault<X.Span>(
		407,
		`A pattern cannot match a list type.`),
	
	/** */
	PatternCanMatchWhitespaceOnly: createFault<X.Statement>(
		420,
		"Patterns must not be able to match an input " +
		"containing only whitespace characters."),
	
	/** */
	PatternAcceptsLeadingWhitespace: createFault<X.Statement>(
		422,
		"Patterns must not be able to match an input " +
		"containing only whitespace characters."),
	
	/** */
	PatternRequiresLeadingWhitespace: createFault<X.Statement>(
		424,
		"Patterns must not be able to match an input " +
		"containing only whitespace characters."),
	
	/** */
	PatternAcceptsTrailingWhitespace: createFault<X.Statement>(
		426,
		"Patterns must not be able to match an input " +
		"containing only whitespace characters."),
	
	/** */
	PatternRequiresTrailingWhitespace: createFault<X.Statement>(
		428,
		"Patterns must not be able to match an input " +
		"containing only whitespace characters."),
	
	/** */
	PatternNonCovariant: createFault<X.Statement>(
		440,
		"Pattern does not match it's base types."),
	
	/** */
	PatternPartialWithCombinator: createFault<X.Statement>(
		442,
		"Partial patterns cannot explicitly match the comma character."),
	
	/** */
	PatternsFormDiscrepantUnion: createFault<X.Span>(
		499,
		"A union cannot be created between these types because their " + 
		"associated patterns conflict with each other."),
	
	
	// 
	// Infix related
	// 
	
	
	/** */
	InfixHasQuantifier: createFault<X.Statement>(
		500, //0,
		`Infixes cannot have quantifiers ${quantifiers} applied to them`),
	
	/** */
	InfixHasDuplicateIdentifier: createFault<X.InfixSpan>(
		501, //0,
		`Infixes cannot have duplicate identifiers.`),
	
	/** */
	InfixHasSelfReferentialType: createFault<X.InfixSpan>(
		503, //410,
		"Infixes cannot be self-referential."),
	
	/** */
	InfixNonConvariant: createFault<X.InfixSpan>(
		505, //412,
		"Infixes must be compatible with their bases."),
	
	/** */
	InfixCannotDefineNewTypes: createFault<X.InfixSpan>(
		507, //422,
		`A type referenced in an infix must be contained
		by the pattern statement directly, or be contained
		by one of it's matched bases.`),
	
	/** */
	InfixReferencedTypeMustHavePattern: createFault<X.InfixSpan>(
		509, //414,
		"Types applied to an infix must have at least one associated pattern."),
	
	/** */
	InfixReferencedTypeCannotBeRecursive: createFault<X.InfixSpan>(
		511, //416,
		"Types applied to an infix must not create a recursive structure."),
	
	/** */
	InfixContractViolation: createFault<X.InfixSpan>(
		513, //424,
		"Infix type annotations must explicitly expand the type as defined by the base."),
	
	/** */
	InfixPopulationChaining: createFault<X.InfixSpan>(
		515, //426,
		"Population infixes cannot have multiple declarations."),
	
	/** */
	InfixUsingListOperator: createFault<X.InfixSpan>(
		517, //0,
		`Infix identifiers cannot end with the list operator (${X.Syntax.list}).`),
	
	/** */
	InfixReferencingList: createFault<X.InfixSpan>(
		519, //428,
		"Infixes cannot reference list types."),
	
	/** */
	PortabilityInfixHasMultipleDefinitions: createFault<X.InfixSpan>(
		521, //418,
		`Portability infixes with compatible types cannot
		be specified more than once.`),
	
	/** */
	PortabilityInfixHasUnion: createFault<X.InfixSpan>(
		523, //418,
		`Portability infixes with unioned types are not supported at this time.`),
	
	/** */
	PopulationInfixHasMultipleDefinitions: createFault<X.InfixSpan>(
		525, //0,
		`Declarations in a population infix cannot be 
		defined twice in the same pattern`),
	
	/** */
	NominalInfixMustSubtype: createFault<X.Span>(
		527, //430,
		"Patterns with nominal infixes require an input that is " +
		"a subtype of the type specified, not the type itself."),
	
	
	//
	// Parse errors
	//
	
	
	/** */
	StatementBeginsWithComma: createFault<X.Statement>(
		600,
		"Statements cannot begin with a comma."),
	
	/** */
	StatementBeginsWithEllipsis: createFault<X.Statement>(
		602,
		"Statements cannot begin with an ellipsis (...)."),
	
	/** */
	StatementBeginsWithEscapedSpace: createFault<X.Statement>(
		604,
		"Statements cannot begin with an escape character (\\) " + 
		"that is followed by a tab or space."),
	
	/** */
	StatementContainsOnlyEscapeCharacter: createFault<X.Statement>(
		604,
		"A statement cannot consist of a single escape character (\\)"),
	
	
	//
	// Parsing Faults
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
	UnterminatedCharacterSet: createFault<X.Statement>(
		1002,
		`Unterminated character set. Pattern has an opening
		"${X.RegexSyntaxDelimiter.setStart}" character without a matching
		"${X.RegexSyntaxDelimiter.setEnd}" character.`),
	
	/** */
	UnterminatedGroup: createFault<X.Statement>(
		1004,
		`Unterminated group. Pattern has an opening
		"${X.RegexSyntaxDelimiter.groupStart}" character without a matching
		"${X.RegexSyntaxDelimiter.groupEnd}" character.`),
	
	/** */
	DuplicateQuantifier: createFault<X.Statement>(
		1006,
		`Multiple consecutive quantifiers ${quantifiers} are not allowed.`),
	
	/** */
	UnterminatedInfix: createFault<X.Statement>(
		1008,
		`Unterminated infix. Pattern has an opening ${X.InfixSyntax.start},
		${X.InfixSyntax.nominalStart}, ${X.InfixSyntax.patternStart} delimiter without
		a matching closing delimiter.`),
	
	/** */
	EmptyPattern: createFault<X.Statement>(
		1010,
		`Pattern has no matchable content.`),
});


// Additional safety
Array.from(Faults.each()).every(Object.freeze);
