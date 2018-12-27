import * as X from "../../X";


/**
 * 
 */
export class Line
{
	/*** */
	constructor(
		readonly sourceText: string,
		readonly indent: number,
		readonly declarations: X.Bounds<DeclarationSubject>,
		readonly annotations: X.Bounds<AnnotationSubject>,
		readonly flags: LineFlags,
		readonly jointPosition: number)
	{ }
}


/**
 * Stores a map of the character offsets within a Statement
 * that represent the starting positions of the statement's
 * declarartions.
 */
export type DeclarationSubject = X.Identifier | X.Pattern | X.Uri;

/**
 * Stores a map of the character offsets within a Statement
 * that represent the starting positions of the statement's
 * annotations.
 */
export type AnnotationSubject = X.Identifier;


/**
 * 
 */
export enum LineFlags
{
	none = 0,
	isRefresh = 1,
	isComment = 2,
	isWhitespace = 4,
	isDisposed = 8,
	isUnparsable = 16,
	hasUri = 32,
	hasTotalPattern = 64,
	hasPartialPattern = 128,
	hasPattern = 256
}
