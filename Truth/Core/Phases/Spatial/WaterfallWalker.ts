import * as X from "../../X";


/**
 * @internal
 * This class performs traversal on an analyzed Waterfall.
 * It allows a Waterfall to be traversed safely (i.e., without
 * touching fans that have been marked as object-level or
 * type-level cruft).
 */
export class WaterfallWalker
{
	/** */
	constructor(waterfall: X.Waterfall, skipSet: ReadonlySet<X.Fan>)
	{
		
	}
}
