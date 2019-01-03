import * as X from "../../X";


/**
 * Stores information about a line, after being parsed.
 * A Line is different from a Statement in that it has no
 * relationship to a Document.
 */
export class Line
{
	/*** */
	constructor(
		readonly sourceText: string,
		readonly indent: number,
		readonly declarations: X.BoundaryGroup<X.DeclarationSubject>,
		readonly annotations: X.BoundaryGroup<X.AnnotationSubject>,
		readonly sum: string,
		readonly jointPosition: number,
		readonly flags: LineFlags,
		readonly parseFault: X.ParseFault | null)
	{ }
}


/**
 * A bit field enumeration used to efficiently store
 * meta data about a Line (or a Statement) object.
 */
export enum LineFlags
{
	none = 0,
	isRefresh = 1,
	isComment = 2,
	isWhitespace = 4,
	isDisposed = 8,
	isCruft = 16,
	hasUri = 32,
	hasTotalPattern = 64,
	hasPartialPattern = 128,
	hasPattern = 256
}
