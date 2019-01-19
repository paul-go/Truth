import * as X from "../../X";


/**
 * A class that represents a single object in the graph
 * of (what eventually becomes) parallel types. Parallel
 * objects link to other Parallel objects through ParallelEdge
 * classes, which allow consumers to scan through the
 * parallels that relate to a specific Node.
 * 
 * Parallels can either be "specified" or "unspecified".
 * This class represents the "unspecified" variant,
 * where as the derived class "SpecifiedParallel" represents
 * the former.
 */
export abstract class Parallel
{
	/**
	 * @returns A Parallel object that was previously constructed
	 * within the specified LayerContext, that matches the specified
	 * URI, or null in the case when no such Parallel exists.
	 */
	protected static getExistingParallel(uri: X.Uri, context: X.LayerContext)
	{
		const parallelMap = this.constructedParallels.get(context);
		return parallelMap ?
			parallelMap.get(uri.toString(true, true)) || null :
			null;
	}
	
	/**
	 * Stores a map of all the Parallel objects that have been
	 * created for each LayerContext. The purpose of this is
	 * to prevent the two separate Parallel instances from
	 * being created that correspond to the same Node.
	 */
	protected static readonly constructedParallels = 
		new WeakMap<X.LayerContext, Map<string, X.Parallel>>();
	
	/** */
	protected constructor(
		readonly uri: X.Uri,
		readonly container: X.Parallel | null,
		protected readonly context: X.LayerContext)
	{
		this.name = uri.typePath.join("/");
		
		const existingParallelMap = (() =>
		{
			const map = Parallel.constructedParallels.get(context);
			if (map !== undefined)
				return map;
			
			const newMap = new Map<string, X.Parallel>();
			Parallel.constructedParallels.set(context, newMap);
			return newMap;
		})()
		
		const uriText = uri.toString(true, true);
		if (existingParallelMap.has(uriText))
			throw X.Exception.unknownState();
		
		existingParallelMap.set(uriText, this);
	}
	
	readonly version = X.VersionStamp.next();
	
	/**
	 * Stores a string representation of this Parallel,
	 * useful for debugging purposes.
	 */
	readonly name: string;
	
	/**
	 * Stores an array of other Parallel instances to which
	 * this Parallel connects. For example, the following
	 * document, the Parallel object corresponding to the
	 * last "Field" would have two edges, pointing to two
	 * other Parallel instances corresponding to the "Field"
	 * declarations contained by "Left" and "Right".
	 * 
	 * Left
	 * 	Field
	 * Right
	 * 	Field
	 * Bottom : Left, Right
	 * 	Field
	 */
	get edges()
	{
		return Object.freeze(this._edges.slice());
	}
	private readonly _edges: Parallel[] = [];
	
	/**
	 * Adds an edge between this Parallel instance and
	 * the instance specified, if an equivalent edge does
	 * not already exist.
	 */
	maybeAddEdge(toParallel: Parallel)
	{
		if (toParallel === this)
			throw X.Exception.unknownState();
		
		if (!this._edges.includes(toParallel))
			this._edges.push(toParallel);
	}
	
	/**
	 * Performs a depth-first traversal of all nested Parallel instances,
	 * and yields each one (this Parallel instance is excluded).
	 */
	*traverseParallels()
	{
		function *recurse(parallel: Parallel): IterableIterator<Parallel>
		{
			for (const edge of parallel.edges)
			{
				yield* recurse(edge);
				yield edge;
			}
		}
		
		yield* recurse(this);
	}
	
	/**
	 * Performs a depth-first traversal of all nested SpecifiedParallel
	 * instances, and yields each one (this Parallel instance is excluded).
	 */
	*traverseParallelsSpecified()
	{
		function *recurse(parallel: Parallel): IterableIterator<X.SpecifiedParallel>
		{
			for (const edge of parallel.edges)
			{
				yield* recurse(edge);
				
				if (edge instanceof X.SpecifiedParallel)
					yield edge;
			}
		}
		
		yield* recurse(this);
	}
	
	/** */
	abstract descend(typeName: string): X.Parallel;
}
