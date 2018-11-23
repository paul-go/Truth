import * as X from "./X";

/*

The Type class deals with the following concerns
on top of what is already provided by the Node class:

- Polymorphic type resolution
- Calculating type contracts
- Fault reporting
- Resolving aliases
- Circular inheritance detection

*/

/**
 * A class that defines a type located within a
 * scope, that has passed all verification tests.
 * This class is essentially a lens ontop of
 * GraphNode.
 */
export class Type
{
	/**
	 * Creates a new Type from the specified Spine.
	 * If a Type already exists at the location the corresponds
	 * to the spine, the existing Type is returned instead.
	 */
	static get(spine: X.Spine)
	{
		const uri = X.Uri.create(spine);
		const strand = spine.document.program.fragmenter.query(uri);
		if (!strand)
			throw X.ExceptionMessage.unknownState();
		
		return this.getFromFunctor(X.Functor.get(strand));
	}
	
	/** */
	private static getFromFunctor(functor: X.Functor)
	{
		const existingType = this.cache.get(functor);
		if (existingType)
			return existingType;
		
		const newType = new Type(functor);
		this.cache.set(functor, newType);
		return newType;
	}
	
	/** */
	private static readonly cache = new WeakMap<X.Functor, Type>();
	
	/** */
	private constructor(private readonly functor: X.Functor)
	{
		
		// 
		// Perform epic type construction algorithm here.
		//
		
	}
	
	/**
	 * Stores an array of Faults that where generated as a result of
	 * analyzing this Type. Note that Faults generated in this way
	 * can also be found in the FaultService.
	 */
	get faults()
	{
		if (this._faults)
			return this._faults;
		
		return this._faults = [];
	}
	private _faults: ReadonlyArray<X.Fault> | null = null;
	
	/** */
	get uri() { return this.functor.uri; }
	
	/** */
	get name() { return this.functor.name; }
	
	/** */
	get stamp() { return this.functor.stamp; }
	
	/** */
	get contents()
	{
		if (this._contents)
			return this._contents;
		
		return this._contents = this.functor.contents.map(fntr => Type.getFromFunctor(fntr));
	}
	private _contents: Type[] | null = null;
}
