import * as X from "./X";


/**
 * A class that defines a type located within a
 * scope, that has passed all verification tests.
 * This class is essentially a lens ontop of
 * Functor.
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
	
	/**
	 * Searches for a Type at the specified URI.
	 * The URI may refer to a location in an unspecified
	 * area of the document (such as if the URI refers to
	 * an inherited type or a descendant of a recursive type).
	 */
	static find(uri: X.Uri, owner: X.Document | X.Program)
	{
		if (!owner)
			throw X.ExceptionMessage.invalidArgument();
		
		const document = owner instanceof X.Document ?
			owner :
			owner.documents.get(uri);
		
		if (!document)
			throw X.ExceptionMessage.documentNotLoaded();
		
		const fragmenter = document.program.fragmenter;
		
		// The first step is to construct types, that exist within
		// in "specified" land. following the names defined
		// in the URI from left to right.
		
		const longestSpecifiedStrand = (() =>
		{
			let out: X.Strand | null = null;
			
			for (let nameIdx = uri.typePath.length; nameIdx-- > 0;)
			{
				const retractedUri = uri.retract(0, nameIdx);
				const strand = fragmenter.query(retractedUri);
				if (!strand)
					return out;
				
				out = strand;
			}
			
			return out;
		})();
		
		// In the case when not even a single name from
		// the type URI could be matched to a specified
		// location in the document, null is returned.
		if (longestSpecifiedStrand === null)
			return null;
		
		const specifiedLength = longestSpecifiedStrand.molecules.length;
		
		// Sanity check
		if (specifiedLength > uri.typePath.length)
			return X.ExceptionMessage.unknownState();
		
		const initialFunctor = X.Functor.get(longestSpecifiedStrand);
		const initialType = this.getFromFunctor(initialFunctor);
		
		// In the case when the URI refers to a location that is fully
		// within the specified portion of the document, we can 
		// simply return a new Type from the Functor that
		// corresponds to that location.
		if (specifiedLength === uri.typePath.length)
			return initialType;
		
		const unspecifiedPortion = uri.typePath.slice(specifiedLength);
		
		
		
	}
	
	/** */
	private static readonly cache = new WeakMap<X.Functor, Type>();
	
	/** */
	private constructor(private readonly functor: X.Functor) { }
	
	
	//
	// Document-related properties
	//
	
	
	/** */
	get uri() { return this.functor.uri; }
	
	/** */
	get name() { return this.functor.name; }
	
	/** */
	get subject() { return this.functor.atom.subject; }
	
	/**
	 * Gets an array of the underlying spans that compose this type.
	 */
	get spans() { return this.functor.atom.spans; }
	
	
	/**
	 * Gets an array of the statements that contains
	 * the spans that compose this type.
	 */
	get statements()
	{
		return Array.from(new Set(this.spans.map(span => span.statement)));
	}
	
	/** */
	get stamp() { return this.functor.stamp; }
	
	/** Gets a reference to the Type that is the direct container of this one. */
	get container()
	{
		if (this._container !== undefined)
			return this._container;
		
		const fntrCtr = this.functor.container;
		
		return this._container = fntrCtr !== null ?
			Type.getFromFunctor(fntrCtr) :
			null;
	}
	private _container: Type | null | undefined = undefined;
	
	/**
	 * Gets an array of the containers that have been resolved as
	 * bases of this container, computed as a result of applying
	 * the contextual type resolution rules.
	 */
	get containersResolved()
	{
		if (this._containerssResolved !== undefined)
			return this._containerssResolved;
		
		const fntrCtr = this.functor.container;
		
		return this._containerssResolved = fntrCtr !== null ?
			Type.getFromFunctor(fntrCtr) :
			null;
	}
	private _containerssResolved: Type | null | undefined = undefined;
	
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
	get contents()
	{
		return this._contents ?
			this._contents :
			(this._contents = this.functor.contents.map(fntr => Type.getFromFunctor(fntr)));
	}
	private _contents: Type[] | null = null;
}
