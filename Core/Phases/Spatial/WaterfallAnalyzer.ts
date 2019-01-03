import * as X from "../../X";


/**
 * @internal
 * This is the main class that performs type verification.
 * It analyzes a waterfall, produces a skip set (which is a
 * Set<X.Fan> that indicates which fans were found to be
 * type-level cruft). The skip set is fed to a WaterfallWalker
 * instance.
 */
export class WaterfallAnalyzer
{
	/** */
	static invoke(waterfall: X.Waterfall)
	{
		const skipSet = new Set<X.Fan>();
		
		
		
		return skipSet;
	}
}
