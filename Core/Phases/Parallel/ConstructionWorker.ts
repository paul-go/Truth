import * as X from "../../X";


/**
 * A worker class that handles the construction of networks
 * of Parallel instances, which are eventually transformed
 * into type objects.
 */
export class ConstructionWorker
{
	/** */
	constructor(private readonly program: X.Program) { }
	
	/**
	 * Constructs the corresponding Parallel instances for
	 * all specified types that exist within the provided Document,
	 * or below the provided SpecifiedParallel.
	 */
	excavate(from: X.Document | X.SpecifiedParallel)
	{
		const queue: X.SpecifiedParallel[] = [];
		
		const processNodes = (iterator: IterableIterator<X.Node>) =>
		{
			for (const node of iterator)
			{
				const drilledParallel = this.drillFromNode(node);
				if (drilledParallel !== null)
					queue.push(drilledParallel);
			}
		}
		
		from instanceof X.Document ?
			processNodes(this.program.graph.readRoots(from)) :
			queue.push(from);
		
		for (const currentParallel of queue)
			processNodes(currentParallel.node.contents.values());
	}
	
	/**
	 * Constructs the fewest possible Parallel instances
	 * to arrive at the type specified by the directive.
	 */
	drill(directive: X.Uri)
	{
		const result = this.drillFromUri(directive);
		this.drillQueue.length = 0;
		return result;
	}
	
	/** */
	private drillFromUri(directive: X.Uri)
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
	 * An entrypoint into the drill function that operates
	 * on a Node instead of a Uri. Detects circular invokations,
	 * and returns null in these cases.
	 */
	private drillFromNode(node: X.Node)
	{
		// Circular drilling is only a problem if we're
		// drilling on the same level.
		const q = this.drillQueue;
		
		if (q.length === 0)
		{
			q.push(node);
		}
		else if (q[0].container === node.container)
		{
			if (q.includes(node))
				return null;
		}
		else
		{
			q.length = 0;
			q.push(node);
		}
		
		const drillResult = this.drillFromUri(node.uri);
		if (drillResult === null)
			throw X.Exception.unknownState();
		
		if (!(drillResult instanceof X.SpecifiedParallel))
			throw X.Exception.unknownState();
		
		return drillResult;
	}
	
	/** A call queue used to prevent circular drilling. */
	private readonly drillQueue: X.Node[] = [];
	
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
			if (this.rakedBaseGraphs.has(seed))
				return seed;
			
			this.rakedBaseGraphs.add(seed);
			
			const contract = this.contracts.get(srcParallel) || (() =>
			{
				const contract = new X.Contract(srcParallel);
				this.contracts.set(srcParallel, contract);
				return contract;
			})();
			
			for (const hyperEdge of srcParallel.node.outbounds)
			{
				if (this.cruft.has(hyperEdge))
					continue;
				
				const possibilities = hyperEdge.successors
					.filter(scsr => !this.cruft.has(scsr.node))
					.sort((a, b) => a.longitude - b.longitude);
				
				for (const possibleScsr of possibilities)
				{
					const possibleNode = possibleScsr.node;
					const baseParallel = this.drillFromNode(possibleNode);
					
					// baseParallel will be null in the case when a circular
					// relationship has been detected (and quitting is
					// required here in order to avoid a stack overflow).
					if (baseParallel === null)
						continue;
					
					rakeBaseGraph(baseParallel);
					
					// This is where the polymorphic name resolution algorithm
					// takes place. The algorithm operates by working it's way
					// up the list of nodes (aka the scope chain), looking for
					// a possible resolution target where the act of applying the
					// associated Parallel as a base causes at least one of the 
					// conditions on the contract to be satisfied. Or, in the case
					// when there are no conditions on the contract, the node
					// that is the closest ancestor is used.
					
					const satisfyCount = contract.trySatisfyCondition(baseParallel);
					if (satisfyCount == 0 && contract.hasConditions)
						continue;
					
					this.sanitizer.tryAddBase(srcParallel, baseParallel, hyperEdge);
					
					if (this.handledHyperEdges.has(hyperEdge))
						throw X.Exception.unknownState();
					
					this.handledHyperEdges.add(hyperEdge);
					break;
				}
			}
			
			if (contract.unsatisfiedConditions.size > 0)
				for (const smt of srcParallel.node.statements)
					this.program.faults.report(new X.Fault(
						X.Faults.ContractViolation,
						smt));
			
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
	 * Used for safety purposes to catch unexpected behavior.
	 */
	private readonly handledHyperEdges = new WeakSet<X.HyperEdge>();
	
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
					return (
						this.parallels.get(nextNode) ||
						this.parallels.create(nextNode, this.cruft));
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
		
		const pruneParallelsFollowFn = (par: X.Parallel) =>
		{
			const upperParallels = par.getParallels().slice();
			if (par instanceof X.SpecifiedParallel)
				for (const { base } of par.eachBase())
					upperParallels.push(base);
			
			return upperParallels;
		}
		
		const hasSpecifiedContents = X.Misc.reduceRecursive(
			zenith,
			pruneParallelsFollowFn,
			(current, results: ReadonlyArray<boolean>) =>
			{
				const prune = 
					results.every(result => !result) &&
					!canDescendToSpecified(current);
				
				if (prune)
					prunedParallels.add(current);
				
				return !prune;
			});
		
		// In the case when the method is attempting to descend
		// to a level where there are no nodes whose name match
		// the type name specified (i.e. the whole layer would be 
		// unspecified parallels), null is returned because a descend
		// wouldn't make sense.
		if (!hasSpecifiedContents)
			return null;
		
		const descendParallelsFollowFn = (par: X.Parallel) =>
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
			descendParallelsFollowFn,
			(current, nested: ReadonlyArray<X.Parallel>) =>
			{
				const nextPar = descendOne(current);
				
				for (const edge of nested)
					nextPar.addParallel(edge);
				
				return nextPar;
			});
		
		return seed;
	}
	
	/** */
	private readonly parallels = new X.ParallelCache();
	
	/** Stores the set of Parallel instances that have been raked. */
	private readonly rakedBaseGraphs = new WeakSet<X.Parallel>();
	
	/** */
	private readonly cruft = new X.CruftCache(this.program);
	
	/** */
	private readonly sanitizer = new X.ParallelSanitizer(this, this.cruft);
	
	/** */
	private readonly contracts = 
		new WeakMap<X.SpecifiedParallel, X.Contract>();
}
