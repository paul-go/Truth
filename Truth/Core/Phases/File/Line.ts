import * as X from "../../X";


/**
 * 
 */
export class Line
{
	constructor(
		readonly sourceText: string,
		readonly indent: number,
		readonly declarations: X.DeclarationBounds,
		readonly annotations: X.AnnotationBounds,
		readonly flags: LineFlags,
		readonly jointPosition: number)
	{ }
}


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
	isUnparsable = 16
}


/**
 * Stores a map of the character offsets within a Statement
 * that represent the starting positions of the statement's
 * declarartions.
 */
export type DeclarationBounds = 
	ReadonlyMap<number, X.Identifier | X.Pattern | X.Uri | null>;

/**
 * Stores a map of the character offsets within a Statement
 * that represent the starting positions of the statement's
 * annotations.
 */
export type AnnotationBounds = 
	ReadonlyMap<number, X.Identifier | null>;
