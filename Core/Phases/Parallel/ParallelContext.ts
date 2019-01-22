import * as X from "../../X";


/**
 * 
 */
export class ParallelContext
{
	/** */
	constructor(private readonly program: X.Program) { }
	
	/** */
	excavate(directive: X.Uri)
	{
		const result = this.excavateFromUri(directive);
		this.excavationQueue.length = 0;
		return result;
	}
	
	/** */
	private excavateFromUri(directive: X.Uri)
	{
		if (this.parallels.has(directive))
			return X.Guard.defined(this.parallels.get(directive));
		
		const typePath = directive.typePath.slice();
		if (typePath.length === 0)
			throw X.Exception.invalidArgument();
		
		const sourceDoc = this.program.documents.get(directive);
		if (sourceDoc === null)
			throw X.Exception.documentNotLoaded();
		
		const surfaceNode = this.program.graph.read(
			sourceDoc,
			typePath[0]);
		
		if (surfaceNode === null)
			return null;
		
		let typeIdx = 0;
		let lastSeed = 
			this.parallels.get(directive.retractTo(1)) ||
			this.rake(this.parallels.create(surfaceNode, this.cruft));
		
		// We can pass by any Parallel instances that have already
		// been constructed. The real work begins when we get to
		// the first point in the URI where there is no constructed
		// Parallel instance.
		for (;;)
		{
			const uri = directive.retractTo(typeIdx + 1);
			if (!this.parallels.has(uri))
				break;
			
			lastSeed = X.Guard.defined(this.parallels.get(uri));
			
			if (++typeIdx >= typePath.length)
				return lastSeed;
		}
		
		do
		{
			const uri = directive.retractTo(typeIdx);
			const uriText = uri.toString(true, true);
			const typeName = typePath[typeIdx];
			
			const descended = this.descend(lastSeed, typeName);
			if (descended === null)
				return null;
			
			lastSeed = this.rake(descended);
		}
		while(++typeIdx < typePath.length);
		
		return lastSeed;
	}
	
	/**
	 * An entrypoint into the excavate function that operates
	 * on a Node instead of a Uri. Detects circular invokations,
	 * and returns null in these cases.
	 */
	private excavateFromNode(node: X.Node)
	{
		// Circular excavation is only a problem if we're
		// excavating on the same level.
		const q = this.excavationQueue;
		
		if (q.length === 0)
		{
			q.push(node);
		}
		else if (q[0].container === node.container)
		{
			if (q.includes(node))
				return null;
			
			q.push(node);
		}
		else
		{
			q.length = 0;
			q.push(node);
		}
		
		const excavationResult = this.excavateFromUri(node.uri);
		if (excavationResult === null)
			throw X.Exception.unknownState();
		
		if (!(excavationResult instanceof X.SpecifiedParallel))
			throw X.Exception.unknownState();
		
		return excavationResult;
	}
	
	/** A call queue used to prevent circular excavations. */
	private readonly excavationQueue: X.Node[] = [];
	
	/**
	 * "Raking" a Parallel is the process of deeply traversing it's
	 * Parallel Graph (depth first), and for each visited Parallel,
	 * deeply traversing it's Base Graph as well (also depth first).
	 * Through this double-traversal process, the Parallel's edges
	 * are constructed into a traversable graph.
	 */
	private rake(seed: X.Parallel)
	{
		const rakeParallelGraph = (par: X.Parallel) =>
		{
			for (const edgePar of par.getParallels())
				rakeParallelGraph(edgePar);
			
			if (par instanceof X.SpecifiedParallel)
				rakeBaseGraph(par);
		}
		
		/**
		 * Recursively follows the bases of the specified source Node.
		 * Parallel instances are created for any visited Node instance
		 * that does not have one already created.
		 * Although the algorithm is careful to avoid circular bases, it's
		 * too early in the processing pipeline to report these circular
		 * bases as faults. This is because polymorphic name resolution
		 * needs to take place before the system can be sure that a 
		 * seemingly-circular base structure is in fact what it seems.
		 * True circular base detection is therefore handled at a future
		 * point in the pipeline.
		 */
		const rakeBaseGraph = (srcParallel: X.SpecifiedParallel) =>
		{
			for (const { dstParallel, via } of this.follow(srcParallel))
			{
				const baseEdgeParallel = rakeBaseGraph(
					dstParallel);
				
				if (baseEdgeParallel === null)
					continue;
				
				srcParallel.addBase(dstParallel, via);
				this.sanitizer.sanitize(srcParallel);
			}
			
			return srcParallel;
		}
		
		// If the seed's container is null, this means that the seed
		// is root-level, and so it cannot have any Parallel types.
		// It may however have Base types, and these need to be
		// handled.
		if (seed.container === null)
		{
			if (!(seed instanceof X.SpecifiedParallel))
				throw X.Exception.unknownState();
			
			rakeBaseGraph(seed);
		}
		else rakeParallelGraph(seed);
		
		return seed;
	}
	
	/**
	 * Enumerates through the bases of the specified Parallel,
	 * applying the system's polymorphic name resolution rules.
	 */
	private *follow(srcParallel: X.SpecifiedParallel)
	{
		for (const hyperEdge of srcParallel.node.outbounds)
		{
			if (this.cruft.has(hyperEdge))
				continue;
			
			const possibilities = hyperEdge.successors
				.filter(scsr => !this.cruft.has(scsr.node))
				.sort((a, b) => a.longitude - b.longitude);
			
			if (possibilities.length === 0)
				continue;
			
			// If srcParallel has no Parallels, it means that it's an
			// apex, and the polymorphic responsibilities can be
			// avoided, and we can resolve to the closest name.
			if (!srcParallel.hasParallels || possibilities.length === 1)
			{
				const dstNode = possibilities[0].node;
				const dstParallel = this.excavateFromNode(dstNode);
				if (dstParallel === null)
					continue;
				
				yield { dstParallel, via: hyperEdge };
			}
			else 
			{
				const contract = srcParallel.getParallels();
				
				for (const possibleScsr of possibilities)
				{
					const possibleNode = possibleScsr.node;
					const dstParallel = this.excavateFromNode(possibleNode);
					if (dstParallel === null)
						continue;
					
					const acceptResult = srcParallel.contract.accepts(dstParallel);
					if (acceptResult.isCovered)
						yield { dstParallel, via: hyperEdge };
				}
			}
		}
	}
	
	/**
	 * Constructs and returns a new seed Parallel from the specified
	 * zenith Parallel, navigating downwards to the specified type name.
	 */
	private descend(zenith: X.Parallel, typeName: string)
	{
		/**
		 * @returns A new Parallel (either being a SpecifiedParallel
		 * or an UnspecifiedParallel instance), that corresponds to
		 * the specified zenith parallel.
		 */
		const descendOne = (zenith: X.Parallel) =>
		{
			if (zenith instanceof X.SpecifiedParallel)
			{
				const nextNode = zenith.node.contents.get(typeName);
				if (nextNode)
					return this.parallels.get(nextNode) ||
						this.parallels.create(nextNode, this.cruft);
			}
			
			const nextUri = zenith.uri.extend([], typeName);
			return this.parallels.create(nextUri);
		}
		
		/**
		 * @returns A boolean value that indicates whether the act
		 * of descending from the specified Parallel to the typeName
		 * passed to the containing method is going to result in a
		 * SpecifiedParallel instance.
		 */
		function canDescendToSpecified(parallel: X.Parallel)
		{
			return (
				parallel instanceof X.SpecifiedParallel &&
				parallel.node.contents.has(typeName));
		}
		
		//
		// TODO: These functions can probably be replaced with
		// a call to X.Misc.reduceRecursive()
		//
		
		function *recurseParallels(par: X.Parallel): IterableIterator<X.Parallel>
		{
			for (const parEdge of par.getParallels())
				yield* recurseParallels(parEdge);
			
			yield par;
		}
		
		function *recurseBases(par: X.SpecifiedParallel): IterableIterator<X.Parallel>
		{
			for (const { base } of par.eachBase())
				yield* recurseBases(base);
			
			yield par;
		}
		
		function *recurse(par: X.Parallel): IterableIterator<X.Parallel>
		{
			for (const parallelEdge of recurseParallels(par))
			{
				if (parallelEdge instanceof X.SpecifiedParallel)
					for (const baseEdge of recurseBases(parallelEdge))
						yield baseEdge;
				
				yield parallelEdge;
			}
		}
		
		// The following algorithm performs a recursive reduction on
		// the zenith, and produces a set of Parallels to prune from the
		// descension process. The Parallels that end up getting pruned
		// are the ones that, if unpruned, would result in a layer that
		// has UnspecifiedParallels that shouldn't actually exist. For
		// example, consider the following document:
		//
		// Class
		// 
		// SubClass : Class
		// 	Child
		// 
		// "Class" should not have an UnspecifiedParallel called "Child",
		// because that was introduced in the derived "SubClass" type.
		// And so this algorithm stakes out cut off points so that we don't
		// blindly just descend all Parallels in the layer.
		const prunedParallels = new Set<X.Parallel>();
		{
			const parallelFollowFn = (par: X.Parallel) =>
			{
				const upperParallels = par.getParallels().slice();
				if (par instanceof X.SpecifiedParallel)
					for (const { base } of par.eachBase())
						upperParallels.push(base);
				
				return upperParallels;
			}
			
			const willCreateValidLayer = X.Misc.reduceRecursive(
				zenith,
				parallelFollowFn,
				(current, results: ReadonlyArray<boolean>) =>
				{
					const prune = 
						results.every(result => !result) &&
						!canDescendToSpecified(current);
					
					if (prune)
						prunedParallels.add(current);
					
					return !prune;
				});
			
			// The case when the layer which is seeded by the zenith
			// provided to this method contains nothing other than 
			// UnspecifiedParallel instances should never happen,
			// because such a descension should never have been
			// allowed to happen in the first place.
			if (!willCreateValidLayer)
				throw X.Exception.unknownState();
		}
		
		const noSpecifiedContents = (() =>
		{
			for (const par of recurse(zenith))
				if (canDescendToSpecified(par))
					return false;
			
			return true;
		})();
		
		// In the case when the method is attempting to descend
		// to a level where there are no nodes whose name match
		// the type name specified (i.e. the whole layer would be 
		// unspecified parallels), null is returned because a descend
		// wouldn't make sense.
		if (noSpecifiedContents)
			return null;
		
		{
			const parallelFollowFn = (par: X.Parallel) =>
			{
				if (!(par instanceof X.SpecifiedParallel))
					return [];
				
				const bases = Array.from(par.eachBase())
					.map(entry => <X.Parallel>entry.base)
					.slice();
				
				const result = bases
					.concat(par.getParallels())
					.filter(par => !prunedParallels.has(par));
				
				return result;
			}
			
			const seed = X.Misc.reduceRecursive(
				zenith,
				parallelFollowFn,
				(current, nested: ReadonlyArray<X.Parallel>) =>
				{
					const nextPar = descendOne(current);
					
					for (const edge of nested)
						nextPar.addParallel(edge);
					
					return nextPar;
				});
			
			return seed;
		}
	}
	
	/** */
	private readonly parallels = new X.ParallelCache();
	
	/** Stores the set of Parallel instances that have been raked. */
	private readonly raked = new Set<X.Parallel>();
	
	/** */
	private readonly cruft = new X.CruftCache(this.program);
	
	/** */
	private readonly sanitizer = new X.ParallelSanitizer(this.cruft);
}
