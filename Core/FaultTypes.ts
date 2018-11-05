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
// Resource Related Faults
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
	
	readonly code = 1000;
	readonly message = "URI points to a resource that could not be resolved.";
}

/** */
export class CircularResourceReferenceFault extends StatementFault
{
	readonly code = 1001;
	readonly message = "URI points to a resource that would cause a circular reference.";
}

/** */
export class InsecureResourceReferenceFault extends StatementFault
{
	readonly code = 1002;
	readonly message = 
		"Documents loaded from remote locations " +
		"cannot reference documents stored locally.";
}


//
// Type Checking Related Faults
//


/** */
export class UnresolvedAnnotationFault extends PointerFault
{
	readonly code = 1101;
	readonly message = "Unresolved annotation.";
}

/** */
export class NonCovariantAnnotationsFault extends StatementFault
{
	readonly code = 1102;
	readonly severity = FaultSeverity.warning;
	readonly message = "Overridden types must explicitly expand the type as defined in the base.";
}


//
// Pluralization Related Faults
//


/** */
export class AnonymousTypeOnPluralFault extends StatementFault
{
	readonly code = 1200;
	readonly message = "Anonymous types cannot be defined on a plural.";
}

/** */
export class DoubleSidedPluralFault extends StatementFault
{
	readonly code = 1201;
	readonly message = "Pluralization cannot exist on both sides of a statement.";
}

/** */
export class MultiplicatePluralizationFault extends StatementFault
{
	readonly code = 1202;
	readonly message = "Cannot pluralize an already pluralized type.";
}

/** */
export class InvalidPluralChildFault extends StatementFault
{
	readonly code = 1203;
	readonly message = "The containing plural cannot contain children of this type.";
}

/** */
export class DeclarationSingularizationFault extends StatementFault
{
	readonly code = 1204;
	readonly message = "Singularization cannot exist on the left side of a statement."
}


//
// Regular Expression Related Faults
//


/** */
export class ExpressionInvalidFault extends StatementFault
{
	readonly code = 1300;
	readonly message = "Invalid Regular Expression.";
}

/** */
export class ExpressionPossiblyMatchesEmptyFault extends StatementFault
{
	readonly code = 1301;
	readonly message = "Regular expression could possibly match an empty list of characters.";
}

/** */
export class ExpressionDoesNotMatchBasesFault extends StatementFault
{
	readonly code = 1302;
	readonly message = "Regular Expression does not match it's base types.";
}

/** */
export class ExpressionAliasingPluralFault extends StatementFault
{
	readonly code = 1303;
	readonly message = "Regular Expressions cannot alias a plural.";
}

/** */
export class NamedEntitiesInRepeatingPatternFault extends StatementFault
{
	readonly code = 1304;
	readonly message = "Named entities cannot exist in a repeating pattern.";
}

/** */
export class ExpressionDescendentsFault extends StatementFault
{
	readonly code = 1305;
	readonly message = "Regular Expression statements cannot have descendant statements.";
}


//
// Formatting Related Warning Faults
//


/** */
export class TabsAndSpacesFault extends StatementFault
{
	readonly code = 2000;
	readonly message = "Statement indent contains a mixture of tabs and spaces.";
	readonly severity = FaultSeverity.warning;
}
