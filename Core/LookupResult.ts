import * as X from "./X";


/**
 * @internal
 */
export type LookupResultType = 
	typeof TargetedLookup | 
	typeof DescendingLookup | 
	typeof SiblingLookup;

/**
 * 
 */
export class TargetedLookup
{
	/** */
	constructor(readonly cluster: X.Span)
	{
	}
}


/**
 * 
 */
export class DescendingLookup
{
	/** */
	constructor(readonly discoveries: ReadonlyArray<TargetedLookup>)
	{
	}
}


/**
 * 
 */
export class SiblingLookup
{
	constructor(
		/** */
		readonly ancestry: ReadonlyArray<X.Span>,
		/** */
		readonly siblings: ReadonlyArray<X.Span>)
	{
	}
}


