import * as X from "../../X";


/**
 * A worker class that handles the construction of networks
 * of Parallel instances, which are eventually transformed
 * into type objects.
 */
export class ConstructionWorker
{
	/** */
	constructor(private readonly program: X.Program)
	{
		this.cruft = new X.CruftCache(this.program);
	}
	
	/**
	 * Constructs the corresponding Parallel instances for
	 * all specified types that exist within the provided Document,
	 * or below the provided SpecifiedParallel.
	 */
	excavate(from: X.Document | X.SpecifiedParallel)
	{
		if (this.excavated.has(from))
			return;
			
		this.excavated.add(from);
		const queue: X.SpecifiedParallel[] = [];
		
		const processNodes = (iterator: IterableIterator<X.Node>) =>
		{
			for (const node of iterator)
			{
				const drilledParallel = this.drillFromNode(node);
				if (drilledParallel !== null)
					queue.push(drilledParallel);
			}
		};
		
		if (from instanceof X.Document)
			processNodes(this.program.graph.readRoots(from));
		else
			queue.push(from);
		
		for (const currentParallel of queue)
			processNodes(currentParallel.node.contents.values());
	}
	
	/** */
	private readonly excavated = new WeakSet<X.SpecifiedParallel | X.Document>();
	
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
			return X.Not.undefined(this.parallels.get(directive));
		
		const typePath = directive.types.slice().map(t => t.value);
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
			this.parallels.get(directive.retractTypeTo(1)) ||
			this.rake(this.parallels.create(surfaceNode, this.cruft));
		
		// We can pass by any Parallel instances that have already
		// been constructed. The real work begins when we get to
		// the first point in the URI where there is no constructed
		// Parallel instance.
		for (;;)
		{
			const uri = directive.retractTypeTo(typeIdx + 1);
			if (!this.parallels.has(uri))
				break;
			
			lastSeed = X.Not.undefined(this.parallels.get(uri));
			
			if (++typeIdx >= typePath.length)
				return lastSeed;
		}
		
		do
		{
			const uri = directive.retractTypeTo(typeIdx);
			const uriText = uri.toString();
			const typeName = typePath[typeIdx];
			
			const descended = this.descend(lastSeed, typeName);
			if (descended === null)
				return null;
			
			lastSeed = this.rake(descended);
		}
		while (++typeIdx < typePath.length);
		
		return lastSeed;
	}
	
	/**
	 * An entrypoint into the drill function that operates
	 * on a Node instead of a Uri. Essentially, this method
	 * calls "drillFromUri()" safely (meaning that it detects
	 * circular invokations, and returns null in these cases).
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
		// If the seed's container is null, this means that the seed
		// is root-level, and so it cannot have any Parallel types.
		// It may however have Base types, and these need to be
		// handled.
		if (seed.container === null)
		{
			if (!(seed instanceof X.SpecifiedParallel))
				throw X.Exception.unknownState();
			
			this.rakeSpecifiedParallel(seed);
		}
		else this.rakeParallelGraph(seed);
		
		return seed;
	}
	
	/**
	 * Recursive function that digs through the parallel graph,
	 * and rakes all SpecifiedParallels that are discovered.
	 */
	private rakeParallelGraph(par: X.Parallel)
	{
		for (const edgePar of par.getParallels())
			this.rakeParallelGraph(edgePar);
		
		if (par instanceof X.SpecifiedParallel)
			this.rakeSpecifiedParallel(par);
	}
	
	/**
	 * Splitter method that rakes both a pattern and a non-pattern
	 * containing SpecifiedParallel.
	 */
	private rakeSpecifiedParallel(par: X.SpecifiedParallel)
	{
		if (this.rakedParallels.has(par))
			return par;
		
		this.rakedParallels.add(par);
		
		if (par.pattern)
			this.rakePatternBases(par);
		else
			this.rakeBaseGraph(par);
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
	private rakeBaseGraph(srcParallel: X.SpecifiedParallel)
	{
		if (srcParallel.pattern)
			throw X.Exception.unknownState();
		
		for (const hyperEdge of srcParallel.node.outbounds)
		{
			if (this.cruft.has(hyperEdge))
				continue;
			
			const possibilities = hyperEdge.successors
				.filter(scsr => !this.cruft.has(scsr.node))
				.sort((a, b) => a.longitude - b.longitude);
			
			if (possibilities.length > 0)
			{
				// This is where the polymorphic name resolution algorithm
				// takes place. The algorithm operates by working it's way
				// up the list of nodes (aka the scope chain), looking for
				// a possible resolution target where the act of applying the
				// associated Parallel as a base causes at least one of the 
				// conditions on the contract to be satisfied. Or, in the case
				// when there are no conditions on the contract, the node
				// that is the closest ancestor is used.
				for (const possibleScsr of possibilities)
				{
					const possibleNode = possibleScsr.node;
					const baseParallel = this.drillFromNode(possibleNode);
					
					// baseParallel will be null in the case when a circular
					// relationship has been detected (and quitting is
					// required here in order to avoid a stack overflow).
					if (baseParallel === null)
						continue;
					
					this.rakeSpecifiedParallel(baseParallel);
					
					// There are cases when an entire parallel needs to be
					// "excavated", meaning that the Parallel's entire subtree
					// of contents needs to be analyzed and converted into
					// parallels. This is necessary because a fully defined set
					// of parallels is required in order to detect discrepant
					// unions (and therefore, report the attempt at a type
					// union as faulty).
					if (srcParallel.baseCount > 0)
					{
						if (srcParallel.baseCount === 1)
							this.excavate(srcParallel.firstBase);
						
						this.excavate(baseParallel);
					}
					
					if (!srcParallel.tryAddLiteralBase(baseParallel, hyperEdge))
						continue;
					
					if (this.handledHyperEdges.has(hyperEdge))
						throw X.Exception.unknownState();
					
					this.handledHyperEdges.add(hyperEdge);
					break;
				}
			}
			else
			{
				// At this point, we've discovered an annotation that we're
				// going to try to resolve as an alias. If this doesn't work,
				// the edge will be marked as cruft. Possibly a future version
				// of this compiler will allow other agents to hook into this
				// process and augment the resolution strategy.
				
				const patternParallels: X.SpecifiedParallel[] = [];
				
				for (const { parallel } of this.ascend(srcParallel))
				{
					this.rakePatternBases(parallel);
					patternParallels.push(parallel);
				}
				
				const identifiers = hyperEdge.fragments
					.map(src => src.boundary.subject)
					.filter((s): s is X.Identifier => s instanceof X.Identifier);
				
				if (identifiers.length === 0)
					continue;
				
				const alias = identifiers[0].fullName;
				
				for (const parallel of patternParallels)
				{
					if (srcParallel.tryAddAliasedBase(parallel, hyperEdge, alias))
					{
						this.handledHyperEdges.add(hyperEdge);
						break;
					}
				}
				
				if (!this.handledHyperEdges.has(hyperEdge))
					this.cruft.add(hyperEdge, X.Faults.UnresolvedAnnotation);
			}
		}
		
		if (!srcParallel.isContractSatisfied)
			for (const smt of srcParallel.node.statements)
				this.program.faults.report(new X.Fault(
					X.Faults.ContractViolation,
					smt));
		
		return srcParallel;
	}
	
	/**
	 * Finds the set of bases that should be applied to the provided
	 * pattern-containing SpecifiedParallel instance, and attempts
	 * to have them applied.
	 */
	private rakePatternBases(patternParallel: X.SpecifiedParallel)
	{
		if (!patternParallel.pattern)
			throw X.Exception.unknownState();
		
		const bases = new Map<X.SpecifiedParallel, X.HyperEdge>();
		const obs = patternParallel.node.outbounds;
		const nameOf = (edge: X.HyperEdge) =>
			edge.fragments[0].boundary.subject.toString();
		
		for (let i = -1; ++i < obs.length;)
		{
			const hyperEdge = obs[i];
			
			if (this.cruft.has(hyperEdge))
				continue;
			
			const len = hyperEdge.successors.length;
			
			// Because resolving pattern bases has non-polymorphic behavior, 
			// we can get away with checking for these faults here without going
			// through the whole drilling process.
			
			if (len === 0)
			{
				this.cruft.add(hyperEdge, X.Faults.UnresolvedAnnotation);
				continue;
			}
			
			if (obs.findIndex(e => nameOf(e) === nameOf(hyperEdge)) !== i)
			{
				this.cruft.add(hyperEdge, X.Faults.IgnoredAnnotation);
				continue;
			}
			
			if (len > 1)
				throw X.Exception.unknownState();
			
			const baseNode = hyperEdge.successors[0].node;
			const baseParallel = this.drillFromNode(baseNode);
			if (baseParallel !== null)
				bases.set(baseParallel, hyperEdge);
		}
		
		// Circular bases still need to be checked. It's unclear how and
		// where to actually do this, while factoring in the constraint
		// that these can be caused through the use of aliases.
		
		// Anything that is a list (with any dimensionality) needs to be
		// cut off, because these bases can't be applied to patterns.
		for (const [base, via] of bases)
			if (base.getListDimensionality() > 0)
				this.cruft.add(via, X.Faults.PatternMatchingList);
		
		// Now we need to determine if any of these bases are redundant.
		// This is done by checking to see if any of the bases are specified
		// somewhere in the base graph of all others.
		for (const [baseA] of bases)
			for (const [baseB, via] of bases)
				if (baseA !== baseB)
					if (baseA.hasBase(baseB))
						this.cruft.add(via, X.Faults.IgnoredAnnotation);
		
		const pattern = patternParallel.node.subject as X.Pattern;
		const span = patternParallel.node.declarations.values().next().value as X.Span;
		const portInfixes = pattern.getInfixes(X.InfixFlags.portability);
		
		if (portInfixes.length > 0)
		{
			const validPortabilityInfixes: X.Infix[] = [];
			
			for (const portInfix of portInfixes)
			{
				const nfxAnnosIter = span.eachAnnotationForInfix(portInfix);
				const nfxAnnos = Array.from(nfxAnnosIter);
				
				if (nfxAnnos.length === 0)
					throw X.Exception.unknownState();
				
				// At this time, we're currently generating a fault in the case when
				// a portability infix has multiple definitions. Although the parser
				// and the Graph-level infrastructure supports this, more study is
				// required in order to determine if this is a characteristic of Truth.
				if (nfxAnnos.length > 1)
				{
					for (const nfx of nfxAnnos.slice(1))
						this.cruft.add(nfx, X.Faults.PortabilityInfixHasUnion);
				}
				else validPortabilityInfixes.push(portInfix);
			}
			
			// This code checks for overlapping types. The algorithm used here is
			// similar to the redundant bases check used above. However, in the case
			// of infixes, these aren't just redundant, they would be problematic if
			// left in. To explain why, try to figure out how a String type would draw
			// it's data out of an alias matching the following pattern:
			// 	/< : Email>< : String> : Type
			// (hint: it doesn't work)
			
			//! Not implemented
		}
		
		// TODO: Check for use of lists within any kind of infix.
		// It's possible for no collected bases to be returned
		// in the case when there were actually annotations
		// specified within the file, but they were all found to
		// be cruft.
		if (bases.size === 0)
			return;
		
		patternParallel.tryApplyPatternBases(bases);
	}
	
	/**
	 * A generator function that works its way upwards, starting at the
	 * provided SpecifiedParallel. The function yields the series of
	 * Parallels that contain Patterns that are visible to the provided
	 * srcParallel. The bases of these parallels have not necessarily
	 * been applied.
	 * 
	 * The ordering of the Parallels yielded is relevant. The instances
	 * that were yielded closer to the beginning take prescedence over
	 * the ones yielded at the end.
	 */
	private *ascend(srcParallel: X.SpecifiedParallel)
	{
		const discoveredPatternNodes = new Set<X.Node>();
		
		const yieldable = (patternNode: X.Node) =>
		{
			discoveredPatternNodes.add(patternNode);
			
			return X.Not.null(
				this.parallels.get(patternNode) ||
				this.parallels.create(patternNode, this.cruft));
		};
		
		function *recurse(current: X.SpecifiedParallel): 
			IterableIterator<IPatternParallel>
		{
			for (const { base, edge } of current.eachBase())
				yield *recurse(base);
			
			if (current instanceof X.SpecifiedParallel)
				for (const node of current.node.contents.values())
					if (node.subject instanceof X.Pattern)
						if (!discoveredPatternNodes.has(node))
							yield {
								pattern: node.subject,
								parallel: yieldable(node)
							};
		}
		
		for (let current = srcParallel.container;
			current instanceof X.SpecifiedParallel;)
		{
			yield *recurse(current);
			current = current.container;
		}
		
		for (const root of this.program.graph.readRoots(srcParallel.node.document))
			if (root.subject instanceof X.Pattern)
				if (!discoveredPatternNodes.has(root))
					yield {
						pattern: root.subject,
						parallel: yieldable(root)
					};
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
		const descendOne = (zenith: X.Parallel): X.Parallel =>
		{
			if (zenith instanceof X.SpecifiedParallel)
			{
				const nextNode = zenith.node.contents.get(typeName);
				if (nextNode)
				{
					const out = this.parallels.get(nextNode) ||
						this.parallels.create(nextNode, this.cruft);
					
					this.verifyDescend(zenith, out);
					return out;
				}
			}
			
			const nextUri = zenith.uri.extendType(typeName);
			return (
				this.parallels.get(nextUri) ||
				this.parallels.create(nextUri));
		};
		
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
				yield *recurseParallels(parEdge);
			
			yield par;
		}
		
		function *recurseBases(par: X.SpecifiedParallel): IterableIterator<X.Parallel>
		{
			for (const { base } of par.eachBase())
				yield *recurseBases(base);
			
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
		};
		
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
		};
		
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
	
	/**
	 * Performs verification on the descend operation.
	 * Reports any faults that can occur during this process.
	 */
	private verifyDescend(
		zenithParallel: X.SpecifiedParallel,
		descendParallel: X.SpecifiedParallel)
	{
		if (descendParallel.node.subject instanceof X.Anon)
			if (zenithParallel.isListIntrinsic)
				this.program.faults.report(new X.Fault(
					X.Faults.AnonymousInListIntrinsic,
					descendParallel.node.statements[0]));
	}
	
	/** */
	private readonly parallels = new X.ParallelCache();
	
	/**
	 * Stores the set of Parallel instances that have been "raked",
	 * which means that that have gone through the process of
	 * having their requested bases applied.
	 * 
	 * This set may include both pattern and non-patterns Parallels,
	 * (even though their raking processes are completely different).
	 */
	private readonly rakedParallels = new WeakSet<X.Parallel>();
	
	/** */
	private readonly cruft: X.CruftCache;
}


/** */
interface IPatternParallel
{
	readonly pattern: X.Pattern;
	readonly parallel: X.SpecifiedParallel;
}

/** */
export type TBaseTable = ReadonlyMap<X.SpecifiedParallel, X.HyperEdge>;
