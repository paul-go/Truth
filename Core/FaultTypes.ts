import * as X from "./X";


//
// Base Fault Types
//


/** */
export type FaultSource = X.Statement | X.Pointer;


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


/** Base class for faults that relate to a specific pointer. */
export abstract class PointerFault extends Fault
{
	constructor(readonly source: X.Pointer) { super(); }
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
export class UnresolvedAnnotationFault extends PointerFault
{
	readonly code = 201;
	readonly message = "Unresolved annotation.";
}

/** */
export class CircularTypeReferenceFault extends PointerFault
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
export class ListContractViolationFault extends PointerFault
{
	readonly code = 301;
	readonly message = "The containing list cannot contain children of this type.";
}

/** */
export class ListIntrinsicExtendingNonList extends PointerFault
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
export class PatternPossiblyMatchesEmptyFault extends StatementFault
{
	readonly code = 404;
	readonly message = "Pattern could possibly match an empty list of characters.";
}

/** */
export class PatternPossiblyMatchesWhitespaceOnlyFault extends StatementFault
{
	readonly code = 420;
	readonly message = "Pattern could possibly match nothing other than whitespace characters.";
}

/** */
export class PatternNonCovariantFault extends StatementFault
{
	readonly code = 406;
	readonly message = "Pattern does not match it's base types.";
}

/** */
export class InlineTypeInRepeatingPatternFault extends StatementFault
{
	readonly code = 408;
	readonly message = "Inline types cannot exist in a repeating context.";
}

/**  */
export class InlineTypeSelfReferentialFault extends StatementFault
{
	readonly code = 410;
	readonly message = "Inline types can't be self-referential.";
}

/**  */
export class InlineTypeNonConvariantFault extends StatementFault
{
	readonly code = 412;
	readonly message = "Inline types can't be self-referential.";
}

/** */
export class InlineTypeNotDefinedFault extends StatementFault
{
	readonly code = 422;
	readonly message = "Inline types must be defined on at least one of their matched bases.";
}

/** */
export class InlineTypeMustHaveExpressionFault extends StatementFault
{
	readonly code = 414;
	readonly message = "Inline types must have at least one associated pattern.";
}

/** */
export class InlineTypeRecursiveFault extends StatementFault
{
	readonly code = 416;
	readonly message = "Recursive types are not allowed as inline types.";
}

/** */
export class InlinePortabilityTypeDuplicatedFault extends StatementFault
{
	readonly code = 418;
	readonly message = "Inline data portability types cannot be specified more than once.";
}

/** */
export class InlineTypeContractViolationFault extends StatementFault
{
	readonly code = 424;
	readonly severity = FaultSeverity.warning;
	readonly message = "Inline type annotations must explicitly expand the type as defined by the base.";
}

/** */
export class InlineTypeChainingFault extends StatementFault
{
	readonly code = 426;
	readonly message = "Inline types cannot be chained together.";
}

/** */
export class InlineTypeReferencingListFault extends StatementFault
{
	readonly code = 428;
	readonly message = "Inline types cannot reference list types.";
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
// Formatting-related warning faults
//


/** */
export class TabsAndSpacesFault extends StatementFault
{
	readonly code = 1000;
	readonly message = "Statement indent contains a mixture of tabs and spaces.";
	readonly severity = FaultSeverity.warning;
}
