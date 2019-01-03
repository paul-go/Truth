import * as X from "../../X";


/**
 * A class that marks out the location of an infix Identifer within
 * it's containing Infix, it's containing Span, and then it's containing
 * Statement, Document, and Program.
 */
export class InfixSpan
{
	constructor(
		readonly containingSpan: X.Span,
		readonly containingInfix: X.Infix,
		readonly boundary: X.Boundary<X.Identifier>)
	{ }
	
	/**
	 * Gets the Statement that contains this Anchor.
	 */
	get statement()
	{
		return this.containingSpan.statement;
	}
	
	/**
	 * Gets a boolean value that indicates whether this InfixSpan
	 * is considered object-level cruft, and should therefore be
	 * ignored during type analysis.
	 */
	get isCruft()
	{
		return this.containingSpan.statement.cruftObjects.has(this);
	}
}
