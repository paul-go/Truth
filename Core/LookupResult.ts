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
	constructor(readonly cluster: X.Pointer)
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
		readonly ancestry: ReadonlyArray<X.Pointer>,
		/** */
		readonly siblings: ReadonlyArray<X.Pointer>)
	{
	}
}


