import * as X from "../../X";


/**
 * A class that represents a fully constructed type within the program.
 */
export class Type
{
	/** @internal */
	static construct(uri: X.Uri, program: X.Program): Type | null
	static construct(spine: X.Spine, program: X.Program): Type
	static construct(param: X.Uri | X.Spine, program: X.Program): Type | null
	{
		const uri = X.Uri.create(param);
		
		const waterfall = X.Waterfall.create(uri, program);
		if (waterfall === null)
			return null;
		
		// If the URI references an unpopulated area.
		if (waterfall.totalHeight > uri.typePath.length)
			return null;
		
		return null;
	}
	
	/** */
	constructor()
	{
		this.waterfall = null!;
		this.container = null!;
		// Perform all type checking in here.
	}
	
	/**
	 * 
	 */
	constructAdjacents()
	{
		// Adjacents are constructed by inspecting the constructed
		// waterfall, and then reading the turns of the floor terrace.
		// We then get the nodes out of the floor terrace, and collect
		// the names of the children that have been defined. Then
		// those names are used to build separate URIs, which are then
		// fed into Type.construct(), and a full set of types is returned.
		
		return [];
	}
	
	/**
	 * 
	 */
	constructContents(): Type[]
	{
		// The behavior of this method is similar to constructAdjacents,
		// but with the distinction that the contents of the floor terrace
		// turns are collected rather than the floor turns themselves.
		// This method may also support a filtering method to find one
		// single contained node.
		
		return [];
	}
	
	/**
	 * Attempts to match the specified string against the
	 * Patterns that resolve to this type. If this type is a pattern,
	 * the input is tested against the inner regular expression.
	 */
	tryMatch(input: string): boolean
	{
		return this.isPattern;
	}
	
	/**
	 * Stores the Waterfall diagram used to construct this type.
	 */
	private readonly waterfall: X.Waterfall;
	
	/**
	 * Stores a text representation of the name of the type,
	 * or a serialized version of the pattern content in the
	 * case when the type is actually a pattern.
	 */
	readonly name: string = "";
	
	/** */
	readonly container: Type;
	
	/**
	 * Stores the array of types from which this type extends.
	 * If this Type extends from a pattern, it is included in this
	 * array.
	 */
	readonly bases: ReadonlyArray<Type> = [];
	
	/**
	 * Stores a reference to the intrinsic side of the list when
	 * this type represents the extrinsic side of a list, or vice
	 * versa. 
	 * Stores null in the case when the type is not a list.
	 */
	readonly listPortal: Type | null = null;
	
	/**
	 * Stores whether this type represents the intrinsic
	 * side of a list.
	 */
	readonly isListIntrinsic: boolean = false;
	
	/**
	 * Stores whether this type represents the extrinsic
	 * side of a list.
	 */
	readonly isListExtrinsic: boolean = false;
	
	/**
	 * Stores whether the bases explicitly assigned to
	 * this type are compliant with the requirements
	 * imposed on this type from it's inheritance source.
	 */
	readonly isContractuallyCompliant: boolean = false;
	
	/** */
	readonly isFresh: boolean = false;
	
	/** */
	readonly isOverride: boolean = false;
	
	/** */
	readonly isAnonymous: boolean = false;
	
	/** */
	readonly inCircularGroup: boolean = false;
	
	/** */
	readonly isPattern: boolean = false;
}
