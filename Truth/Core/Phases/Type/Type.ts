import * as X from "../../X";


interface IStoredContext
{
	version: X.VersionStamp;
	context: X.ParallelContext;
}


/**
 * A class that represents a fully constructed type within the program.
 */
export class Type
{
	/** 
	 * @internal
	 * Constructs one or more Type objects from the specified location.
	 */
	static construct(uri: X.Uri, program: X.Program): Type | null;
	static construct(spine: X.Spine, program: X.Program): Type;
	static construct(param: X.Uri | X.Spine, program: X.Program): Type | null
	{
		const uri = X.Uri.create(param);
		if (uri.typePath.length === 0)
			return null;
		
		if (X.TypeCache.has(uri, program))
		{
			const cached = X.TypeCache.get(uri, program);
			
			// If the cached type exists, but hasn't been compiled yet,
			// we can't return it, we need to compile it first.
			if (cached === null || cached instanceof X.Type)
				return cached;
		}
		
		const context = (() =>
		{
			const stored = this.parallelContextMap.get(program);
			if (stored === undefined)
			{
				const newStored: IStoredContext = {
					version: program.version,
					context: new X.ParallelContext(program)
				};
				
				this.parallelContextMap.set(program, newStored);
				return newStored.context;
			}
			else if (program.version.newerThan(stored.version))
			{
				stored.context = new X.ParallelContext(program);
			}
			
			return stored.context;
		})();
		
		const parallel = context.excavate(uri);
		if (parallel === null)
		{
			X.TypeCache.set(uri, program, null);
			return null;
		}
		
		const parallelLineage = [parallel];
		
		for (let currentParallel = parallel.container; currentParallel !== null;)
		{
			parallelLineage.unshift(currentParallel);
			currentParallel = currentParallel.container;
		}
		
		let lastType: X.Type | null = null;
		
		for (const currentParallel of parallelLineage)
		{
			if (X.TypeCache.has(parallel.uri, program))
			{
				const existingType = X.TypeCache.get(currentParallel.uri, program);
				if (existingType instanceof X.TypeProxy)
					throw X.Exception.unknownState();
				
				if (existingType === null)
					throw X.Exception.unknownState();
				
				lastType = existingType;
			}
			else
			{
				const type: X.Type = new X.Type(currentParallel, lastType, program);
				X.TypeCache.set(currentParallel.uri, program, type);
				lastType = type;
			}
		}
		
		return lastType;
	}
	
	/**
	 * @internal
	 * Constructs the invisible root-level Type object that corresponds
	 * to the specified document.
	 */
	static constructRoots(document: X.Document)
	{
		const program = document.program;
		const roots: X.Type[] = [];
		
		for (const node of program.graph.readRoots(document))
		{
			const type = this.construct(node.uri, program);
			if (type !== null)
				roots.push(type);
		}
		
		return Object.freeze(roots);
	}
	
	/** */
	private static parallelContextMap = new WeakMap<X.Program, IStoredContext>();
	
	/**
	 * 
	 */
	private constructor(
		seed: X.Parallel,
		container: X.Type | null,
		program: X.Program)
	{
		this.private = new TypePrivate(program);
		this.name = seed.uri.typePath[seed.uri.typePath.length - 1];
		this.uri = seed.uri;
		this.container = container;
		
		this.private.parallels = new X.TypeProxyArray(
			seed.getParallels().map(edge =>
				new X.TypeProxy(edge.uri, program)));
		
		if (seed instanceof X.SpecifiedParallel)
		{
			// Need a way to get the "Base edges" here
			// (aka the annotations), and return type proxies
			// for them, which will turn into the type's "bases".
		}
		else if (seed instanceof X.UnspecifiedParallel)
		{
			
		}
		
		/** 
		 * Populating this.bases & this.isList:
		 * (Similar problem as above, I think)
		 */
		this.private.bases = new X.TypeProxyArray([]);
		this.isList = false;
		
		if (seed instanceof X.SpecifiedParallel)
		{
			this.isFresh = seed.getParallels().length === 0;
			
			const sub = seed.node.subject;
			this.isPattern = sub instanceof X.Pattern;
			this.isUri = sub instanceof X.Uri;
			this.isAnonymous = sub instanceof X.Anon;
			this.isSpecified = true;
		}
	}
	
	/**
	 * Stores a text representation of the name of the type,
	 * or a serialized version of the pattern content in the
	 * case when the type is actually a pattern.
	 */
	readonly name: string;
	
	/**
	 * Stores the URI that specifies where this Type was
	 * found in the document.
	 */
	readonly uri: X.Uri;
	
	/**
	 * Stores a reference to the type, as it's defined in it's
	 * next most applicable 
	 */
	get parallels()
	{
		this.private.throwOnDirty();
		return this.private.parallels!.maybeCompile();
	}
	
	/**
	 * Stores the Type that contains this Type, or null in
	 * the case when this Type is top-level.
	 */
	readonly container: X.Type | null;
	
	/**
	 * 
	 */
	get contents()
	{
		/**
		 * This thing needs to go through the parallels and 
		 * find both the specified and the unspecified types.
		 */
		
		if (this.private.contents !== null)
			return this.private.contents;
		
		this.private.throwOnDirty();
		return this.private.contents = Object.freeze([]);
	}
	
	/**
	 * 
	 */
	get contentsIntrinsic()
	{
		if (this.private.contentsIntrinsic !== null)
			return this.private.contentsIntrinsic;
		
		this.private.throwOnDirty();
		return this.private.contentsIntrinsic = Object.freeze([]);
	}
	
	/**
	 * Stores the array of types from which this type extends.
	 * If this Type extends from a pattern, it is included in this
	 * array.
	 */
	get bases(): ReadonlyArray<X.Type>
	{
		this.private.throwOnDirty();
		return Object.freeze([]);
	}
	
	/**
	 * 
	 */
	get superordinates()
	{
		if (this.private.superordinates !== null)
			return this.private.superordinates;
		
		this.private.throwOnDirty();
		return this.private.superordinates = Object.freeze([]);
	}
	
	/**
	 * 
	 */
	get subordinates()
	{
		if (this.private.subordinates !== null)
			return this.private.subordinates;
		
		this.private.throwOnDirty();
		return this.private.subordinates = Object.freeze([]);
	}
	
	/**
	 * 
	 */
	get derivations()
	{
		if (this.private.derivations !== null)
			return this.private.derivations;
		
		this.private.throwOnDirty();
		return this.private.derivations = Object.freeze([]);
	}
	
	/**
	 * 
	 */
	get adjacents()
	{
		// Adjacents need to be constructed in two steps. The first
		// step is to get the names of all the adjacent types (which
		// basically means get their URIs. The second step is to actually
		// construct these types. However, some services don't actually
		// need the fully constructed type (suggestions windows), they
		// just need the names initially. So API consumers should have
		// the ability to do either of these.
		
		if (this.private.adjacents !== null)
			return this.private.adjacents;
		
		this.private.throwOnDirty();
		return this.private.adjacents = Object.freeze([]);
	}
	
	/**
	 * 
	 */
	get patterns()
	{
		if (this.private.patterns !== null)
			return this.private.patterns;
		
		this.private.throwOnDirty();
		
		// This is only going to return the patterns for the immediate
		// type scope, not the ones that exist deeply
		return this.private.patterns = this.adjacents
			.filter(type => type.isPattern)
			.filter(type => type.bases.includes(this));
	}
	
	/**
	 * Gets a map of raw string values representing the
	 * type aliases with which this type has been annotated,
	 * which are keyed by the type to which they resolve.
	 */
	get values()
	{
		if (this.private.values !== null)
			return this.private.values;
		
		this.private.throwOnDirty();
		return this.private.values = new Map();
	}
	
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
	 * Stores whether this Type instance has no annotations applied to it.
	 */
	readonly isFresh: boolean = false;
	
	/** */
	get isOverride() { return this.parallels.length > 0; }
	
	/** */
	get isIntroduction() { return this.parallels.length === 0; }
	
	/**
	 * Stores a value that indicates if this Type was directly specified
	 * in the document, or if it's existence was inferred.
	 */
	readonly isSpecified: boolean = false;
	
	/** */
	readonly isAnonymous: boolean = false;
	
	/** */
	readonly isPattern: boolean = false;
	
	/** */
	readonly isUri: boolean = false;
	
	/** */
	readonly isList: boolean = false;
	
	/**
	 * Gets a boolean value that indicates whether this Type
	 * instance was created from a previous edit frame, and
	 * should no longer be used.
	 */
	get isDirty()
	{
		return this.private.program.version.newerThan(this.private.stamp);
	}
	
	/**
	 * @internal
	 * Internal object that stores the private members
	 * of the Type object. Do not use.
	 */
	private readonly private: TypePrivate;
}


/**
 * @internal
 * A hidden class that stores the private information of
 * a Type instance, used to mitigate the risk of low-rank
 * developers from getting themselves into trouble.
 */
class TypePrivate
{
	constructor(readonly program: X.Program)
	{
		this.stamp = program.version;
	}
	
	/** */
	readonly stamp: X.VersionStamp;
	
	/** */
	contents: ReadonlyArray<X.Type> | null = null;
	
	/** */
	contentsIntrinsic: ReadonlyArray<X.Type> | null = null;
	
	/** */
	bases: X.TypeProxyArray | null = null;
	
	/** */
	parallels: X.TypeProxyArray | null = null;
	
	/** */
	patterns: ReadonlyArray<X.Type> | null = null;
	
	/** */
	values: ReadonlyMap<X.Type, string> | null = null;
	
	/** */
	superordinates: ReadonlyArray<X.Type> | null = null;
	
	/** */
	subordinates: ReadonlyArray<X.Type> | null = null;
	
	/** */
	derivations: ReadonlyArray<X.Type> | null = null;
	
	/** */
	adjacents: ReadonlyArray<Type> | null = null;
	
	/** */
	throwOnDirty()
	{
		if (this.program.version.newerThan(this.stamp))
			throw X.Exception.objectDirty();
	}
}
