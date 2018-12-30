import * as X from "../../X";


/**
 * A class that represents a link between a Node that is
 * contained by another Node, through a Population Infix. 
 * For example, the given the following pattern:
 * 
 * /<Low : Number> - <High : Number> : Range
 * 
 * Two contained types are implicitly created that exist
 * inside the pattern definition, creating a structure that,
 * in effect, looks like:
 * 
 * /<Low> - <High> : Range
 *     Low : Number
 *     High : Number
 * 
 * In this case the implicit "Low" and "High" contained types
 * would each have an Anchor that binds them to the infix
 * in their containing pattern in which they were instantiated.
 */
export class Anchor
{
	constructor(
		readonly infix: X.Infix,
		readonly identifier: X.Identifier)
	{ }
}
