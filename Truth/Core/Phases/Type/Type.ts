import * as X from "../../X";


/**
 * A class that represents a fully constructed type within the program.
 */
export class Type
{
	/** @internal */
	static construct(uri: X.Uri, program: X.Program): Type | null;
	static construct(spine: X.Spine, program: X.Program): Type;
	static construct(param: X.Uri | X.Spine, program: X.Program): Type | null
	{
		const uri = X.Uri.create(param);
		
		const waterfall = X.WaterfallRenderer.invoke(uri, program);
		if (waterfall === null)
			return null;
		
		// If the URI references an unpopulated area.
		if (waterfall.totalHeight > uri.typePath.length)
			return null;
		
		const skipSet = X.WaterfallAnalyzer.invoke(waterfall);
		const walker = new X.WaterfallWalker(waterfall, skipSet);
		
		const faults: X.Fault[] = [];
		const bases: X.Type[] = [];
		const name = uri.typePath[uri.typePath.length - 1];
		let container: Type | null = null;
		let listPortal: Type | null = null;
		let isListIntrinsic = false;
		let isListExtrinsic = false;
		let isFresh = false;
		let isOverride = false;
		let isAnonymous = false;
		let isPattern = false;
		let isUri = false;
		
		
		
		return new Type(
			faults,
			bases,
			name,
			container,
			listPortal,
			isListIntrinsic,
			isListExtrinsic,
			isFresh,
			isOverride,
			isAnonymous,
			isPattern,
			isUri);
	}
	
	/**
	 * 
	 */
	private constructor(
		/**
		 * 
		 */
		readonly faults: ReadonlyArray<X.Fault>,
			
		/**
		 * Stores the array of types from which this type extends.
		 * If this Type extends from a pattern, it is included in this
		 * array.
		 */
		readonly bases: ReadonlyArray<Type>,
		
		/**
		 * Stores a text representation of the name of the type,
		 * or a serialized version of the pattern content in the
		 * case when the type is actually a pattern.
		 */
		readonly name: string,
		
		/**
		 * Stores the Type that contains this Type, or null in
		 * the case when this Type is top-level.
		 */
		readonly container: Type | null,
		
		/**
		 * Stores a reference to the intrinsic side of the list when
		 * this type represents the extrinsic side of a list, or vice
		 * versa. 
		 * Stores null in the case when the type is not a list.
		 */
		readonly listPortal: Type | null,
		
		/**
		 * Stores whether this type represents the intrinsic
		 * side of a list.
		 */
		readonly isListIntrinsic: boolean,
		
		/**
		 * Stores whether this type represents the extrinsic
		 * side of a list.
		 */
		readonly isListExtrinsic: boolean,
		
		/** */
		readonly isFresh: boolean,
		
		/** */
		readonly isOverride: boolean,
		
		/** */
		readonly isAnonymous: boolean,
		
		/** */
		readonly isPattern: boolean,
		
		/** */
		readonly isUri: boolean)
	{ }
	
	/**
	 * 
	 */
	get adjacents()
	{
		// Adjacents are constructed by inspecting the constructed
		// waterfall, and then reading the turns of the floor terrace.
		// We then get the nodes out of the floor terrace, and collect
		// the names of the children that have been defined. Then
		// those names are used to build separate URIs, which are then
		// fed into Type.construct(), and a full set of types is returned.
		
		if (this._adjacents)
			return this._adjacents;
		
		return this._adjacents = [];
	}
	private _adjacents: Type[] = [];
	
	/**
	 * 
	 */
	get contents(): Type[]
	{
		// The behavior of this method is similar to constructAdjacents,
		// but with the distinction that the contents of the floor terrace
		// turns are collected rather than the floor turns themselves.
		// This method may also support a filtering method to find one
		// single contained node.
		
		if (this._adjacents)
			return this._adjacents;
		
		return this._adjacents = [];
	}
	
	/**
	 * Attempts to match the specified string against the
	 * Patterns that resolve to this type. If this type is a pattern,
	 * the input is tested against the inner regular expression.
	 */
	matches(input: string): boolean
	{
		return this.isPattern;
	}
}
