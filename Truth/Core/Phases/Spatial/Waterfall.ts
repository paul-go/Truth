import * as X from "../../X";


/**
 * @internal
 * A class that stores Node and Fan objects plotted on a 2-dimensional
 * matrix, for easy type verification.
 */
export class Waterfall
{
	/** @internal */
	constructor(directive: X.Uri, terraces: (Turn | undefined)[][])
	{
		this.directive = directive;
		this.origin = null!;
		this.terraces = terraces;
	}
	
	/** */
	readonly directive: X.Uri;
	
	/** */
	readonly origin: X.Turn;
	
	/**
	 * @returns The number of terraces in the underlying
	 * waterfall. Used to quickly determine if a URI was directed
	 * at an unpopulated location in a document.
	 */
	readonly totalHeight: number = 0;
	
	/**
	 * Reads a full terrace from the waterfall, from the specified
	 * URI.
	 * 
	 * @throws If the URI has typePath that is not a strict subset
	 * of this Waterfall's directive.
	 */
	readTerrace(uri: X.Uri): ReadonlyArray<X.Turn | undefined>
	{
		if (uri.typePath.length > this.directive.typePath.length)
			throw X.Exception.invalidArgument();
		
		for (let i = -1; ++i < uri.typePath.length;)
			if (uri.typePath[i] !== this.directive.typePath[i])
				throw X.Exception.invalidArgument();
		
		return [];
	}
	
	/** */
	readFloorTerrace()
	{
		// Does this method just throw the Turns back at the 
		// call site? Or should it backing this stuff into something
		// that's easier to use?
		return [];
	}
	
	/** */
	private readonly terraces: ReadonlyArray<(Turn | undefined)[]>;
}

/**
 * 
 */
export class NodesTurn
{
	constructor(
		/**
		 * Stores an array of Nodes, captures, or undefined,
		 * in a way where all indexes line up with the turn directly above
		 * this turn in the matrix.
		 */
		readonly nodes: (X.Node | string | undefined)[] = [])
	{ }
}


/**
 * 
 */
export class FansTurn
{
	constructor(readonly fans: (X.Fan | undefined)[] = []) { }
}

/** */
export type Turn = Freeze<NodesTurn | FansTurn>;
