import * as X from "./X";


//
// Base Fault Types
//


/** */
export type FaultSource = X.Statement | X.Span;


/** Base class for all faults. */
export abstract class Fault
{
	/** */
	readonly severity: FaultSeverity = FaultSeverity.error;
	
	/** A human-readable description of the fault. */
	readonly abstract message: string;
	
	/** An error code, useful for reference purposes, or display in a user interface. */
	readonly abstract code: number;
	
	/** The document object that caused the fault to be reported. */
	readonly abstract source: FaultSource;
}


/** Base class for faults that relate to a specific statement. */
export abstract class StatementFault extends Fault
{
	constructor(readonly source: X.Statement) { super(); }
}


/** Base class for faults that relate to a specific span. */
export abstract class SpanFault extends Fault
{
	constructor(readonly source: X.Span) { super(); }
}


/** */
export enum FaultSeverity
{
	/** Reports an error. */
	error = 1,
	/** Reports a warning. */
	warning = 2
}


//
// Resource-related faults
//


/** */
export class UnresolvedResourceFault extends StatementFault
{
	constructor(source: X.Statement, error?: Error)
	{
		super(source);
		
		if (error)
			this.message += " " + error.message;
	}
	
	readonly code = 100;
	readonly message = "URI points to a resource that could not be resolved.";
}

/** */
export class CircularResourceReferenceFault extends StatementFault
{
	readonly code = 102;
	readonly message = "URI points to a resource that would cause a circular reference.";
}

/** */
export class InsecureResourceReferenceFault extends StatementFault
{
	readonly code = 104;
	readonly message = 
		"Documents loaded from remote locations " +
		"cannot reference documents stored locally.";
}


//
// Type verification faults
//


/** */
export class UnresolvedAnnotationFault extends SpanFault
{
	readonly code = 201;
	readonly message = "Unresolved annotation.";
}

/** */
export class CircularTypeReferenceFault extends SpanFault
{
	readonly code = 203;
	readonly message = "Circular type reference detected.";
}

/** */
export class ContractViolationFault extends StatementFault
{
	readonly code = 204;
	readonly severity = FaultSeverity.warning;
	readonly message = "Overridden types must explicitly expand the type as defined in the base.";
}

/** */
export class TypeCannotBeRefreshedFault extends StatementFault
{
	readonly code = 206;
	readonly severity = FaultSeverity.warning;
	readonly message = 
		"This type cannot be refreshed, because one or more base types are " +
		"imposing a specific type contract on it. Consider omitting the " + 
		X.Syntax.joint + " operator here.";
}


//
// List-related faults
//


/** */
export class AnonymousListIntrinsicTypeFault extends StatementFault
{
	readonly code = 300;
	readonly message = "List-intrinsic types cannot be anonymous.";
}

/** */
export class ListContractViolationFault extends SpanFault
{
	readonly code = 301;
	readonly message = "The containing list cannot contain children of this type.";
}

/** */
export class ListIntrinsicExtendingNonList extends SpanFault
{
	readonly code = 303;
	readonly message = "List-intrinsics cannot extend from a non-list type.";
}


//
// Pattern-related faults
//


/** */
export class PatternInvalidFault extends StatementFault
{
	readonly code = 400;
	readonly message = "Invalid pattern.";
}

/** */
export class PatternWithoutAnnotationFault extends StatementFault
{
	readonly code = 402;
	readonly message = "Pattern has no annotations.";
	readonly severity = FaultSeverity.warning;
}

/** */
export class PatternCanMatchEmptyFault extends StatementFault
{
	readonly code = 404;
	readonly message = "Patterns must not be able to match an empty input.";
}

/** */
export class PatternCanMatchWhitespaceOnlyFault extends StatementFault
{
	readonly code = 420;
	readonly message = 
		"Patterns must not be able to match an input " +
		"containing only whitespace characters.";
}

/** */
export class PatternAcceptsLeadingWhitespaceFault extends StatementFault
{
	readonly code = 434;
	readonly message = 
		"Patterns must not be able to match an input " +
		"containing only whitespace characters.";
}

/** */
export class PatternRequiresLeadingWhitespaceFault extends StatementFault
{
	readonly code = 436;
	readonly message = 
		"Patterns must not be able to match an input " +
		"containing only whitespace characters.";
}

/** */
export class PatternAcceptsTrailingWhitespaceFault extends StatementFault
{
	readonly code = 438;
	readonly message = 
		"Patterns must not be able to match an input " +
		"containing only whitespace characters.";
}

/** */
export class PatternRequiresTrailingWhitespaceFault extends StatementFault
{
	readonly code = 440;
	readonly message = 
		"Patterns must not be able to match an input " +
		"containing only whitespace characters.";
}

/** */
export class PatternNonCovariantFault extends StatementFault
{
	readonly code = 406;
	readonly message = "Pattern does not match it's base types.";
}

/** */
export class PatternUnknownNestedTypesFault extends SpanFault
{
	readonly code = 432;
	readonly message = 
		"The base specified on the containing pattern has no type with this name.";
}

/** */
export class PatternIncompatibleFault extends StatementFault
{
	readonly code = 442;
	readonly message = 
		"This pattern is incompatible with other patterns that match the specified types.";
}

/** */
export class InfixInRepeatingPatternFault extends StatementFault
{
	readonly code = 408;
	readonly message = "Infixes cannot exist in a repeating context.";
}

/**  */
export class InfixSelfReferentialFault extends StatementFault
{
	readonly code = 410;
	readonly message = "Infixes can't be self-referential.";
}

/**  */
export class InfixNonConvariantFault extends StatementFault
{
	readonly code = 412;
	readonly message = "Infixes must be compatible with their bases.";
}

/** */
export class InfixNotDefinedFault extends StatementFault
{
	readonly code = 422;
	readonly message = 
		"Infixes must be defined on at least one of their matched bases.";
}

/** */
export class InfixMustHaveExpressionFault extends StatementFault
{
	readonly code = 414;
	readonly message = "Infixes must have at least one associated pattern.";
}

/** */
export class InfixRecursiveFault extends StatementFault
{
	readonly code = 416;
	readonly message = "Recursive types cannot be referenced within infixes.";
}

/** */
export class InfixContractViolationFault extends StatementFault
{
	readonly code = 424;
	readonly message = 
		"Infix type annotations must explicitly expand the type as defined by the base.";
}

/** */
export class InfixChainingFault extends StatementFault
{
	readonly code = 426;
	readonly message = "Infixes cannot be chained together.";
}

/** */
export class InfixReferencingListFault extends StatementFault
{
	readonly code = 428;
	readonly message = "Infixes cannot reference list types.";
}

/** */
export class PortabilityInfixDuplicatedFault extends StatementFault
{
	readonly code = 418;
	readonly message = 
		"Portability infixes with compatible types cannot be specified more than once.";
}

/** */
export class NominalInfixMustSubtypeFault extends StatementFault
{
	readonly code = 430;
	readonly message = 
		"Patterns with nominal infixes require an input that is " +
		"a subtype of the type specified, not the type itself.";
}

/** */
export class DiscrepantUnionFault extends StatementFault
{
	readonly code = 450;
	readonly message = 
		"A union cannot be created between these types because their " + 
		"associated patterns conflict with each other.";
}


//
// Warnings
//


/** */
export class TabsAndSpacesFault extends StatementFault
{
	readonly code = 1000;
	readonly message = "Statement indent contains a mixture of tabs and spaces.";
	readonly severity = FaultSeverity.warning;
}

/** */
export class IgnoredAnnotationFault extends SpanFault
{
	readonly code = 1001;
	readonly message = 
		"This annotation is ignored because another annotation " +
		"in this statement resolves to the same type.";
	readonly severity = FaultSeverity.warning;
}

/** */
export class IgnoredAliasFault extends SpanFault
{
	readonly code = 1003;
	readonly message = 
		"Aliases (meaning annotations that are matched by patterns) " +
		"can't be added onto types that have a contract put in place " +
		"by a base type.";
	readonly severity = FaultSeverity.warning;
}
