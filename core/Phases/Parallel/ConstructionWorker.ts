
namespace Truth
{
	/**
	 * @internal
	 * A worker class that handles the construction of networks
	 * of Parallel instances, which are eventually transformed
	 * into type objects.
	 * 
	 * Instances of ConstructionWorker are held by the static side
	 * of the Type class, and they're lifetime is equal to a single 
	 * version of the containing Program.
	 */
	export class ConstructionWorker
	{
		/** */
		constructor(private readonly program: Program)
		{
			this.cruft = new CruftCache(this.program);
		}
		
		/**
		 * Resets all memory within this ConstructionWorker instance.
		 */
		reset()
		{
			this.cruft.clear();
			this.parallels.clear();
			this.rakedParallels = new WeakSet();
		}
		
		/**
		 * Constructs the corresponding Parallel instances for
		 * all explicit types that exist within the provided Document,
		 * or below the provided ExplicitParallel.
		 */
		excavate(from: Document | ExplicitParallel)
		{
			if (this.excavated.has(from))
				return;
			
			this.excavated.add(from);
			const queue: ExplicitParallel[] = [];
			
			if (from instanceof Document)
			{
				for (const phrase of Phrase.rootsOf(from))
				{
					const drilledParallel = this.drillNonHypotheticalPhrase(phrase);
					if (drilledParallel !== null)
						queue.push(drilledParallel);
				}
			}
			else for (const currentParallel of queue)
			{
				for (const phrases of currentParallel.phrase.peekMany())
				{
					if (phrases.length > 1)
						throw Exception.unexpectedHomograph();
					
					const phrase = phrases[0];
					const drilledParallel = this.drillNonHypotheticalPhrase(phrase);
					if (drilledParallel !== null)
						queue.push(drilledParallel);
				}
			}
		}
		
		/** */
		private readonly excavated = new WeakSet<ExplicitParallel | Document>();
		
		/**
		 * Constructs the fewest possible Parallel instances
		 * to arrive at the type specified by the directive.
		 */
		drill(directive: Phrase)
		{
			const result = this.drillFromSurface(directive);
			this.drillQueue.length = 0;
			return result;
		}
		
		/**
		 * Proceeds with the drilling operation, beginning at the top-most ancestor
		 * of the phrase provided, and descending downward.
		 */
		private drillFromSurface(directive: Phrase)
		{
			if (this.parallels.has(directive))
				return Not.undefined(this.parallels.get(directive));
			
			if (directive.length === 0)
				throw Exception.invalidArgument();
			
			const ancestry = directive.ancestry;
			const surfacePhrase = directive.ancestry[0];
			
			/*
			TODO
			Is this where we should be managing homographs?
			Or do you need to pass in a clarified directive phrase before
			this is even started?
			Or should we deal with the situation where an unclarified phrase
			is provided?
			
			// The surface phrases are the 1-length phrases that 
			const surfacePhrases = directive.containingDocument.phrase
				.peek(surfacePhrase.terminal, surfacePhrase.clarifierKey);
			
			if (surfacePhrases.length === 0)
				return null;
			
			// Homographs not yet implemented.
			if (surfacePhrases.length > 1)
				throw Exception.notImplemented();
			*/
			
			let typeIdx = 0;
			let lastSeed = 
				this.parallels.get(directive.parent) ||
				this.rake(this.parallels.createExplicit(surfacePhrase, this.cruft));
			
			// This code skips by any Parallel instances that have already
			// been constructed. The real work begins when we get to
			// the first point in the Phrase where there is no constructed
			// Parallel instance.
			for (const phrase of ancestry)
			{
				if (!this.parallels.has(phrase))
					break;
				
				lastSeed = Not.undefined(this.parallels.get(phrase));
				
				if (++typeIdx >= directive.length)
					return lastSeed;
			}
			
			do
			{
				const targetSubject = ancestry[typeIdx].terminal;
				const descended = this.descend(lastSeed, targetSubject);
				if (descended === null)
					return null;
				
				lastSeed = this.rake(descended);
			}
			while (++typeIdx < directive.length);
			
			return lastSeed;
		}
		
		/**
		 * An entrypoint into the drill function that operates
		 * on a Node instead of a Phrase. Essentially, this method
		 * calls "drillFromPhrase()" safely (meaning that it detects
		 * circular invokations, and returns null in these cases).
		 */
		private drillNonHypotheticalPhrase(phrase: Phrase)
		{
			if (phrase.isHypothetical)
				throw Exception.unknownState();
			
			// Circular drilling is only a problem if we're
			// drilling on the same level.
			const dq = this.drillQueue;
			
			if (dq.length === 0)
			{
				dq.push(phrase);
			}
			else if (dq[0].parent === phrase.parent)
			{
				if (dq.includes(phrase))
					return null;
			}
			else
			{
				dq.length = 0;
				dq.push(phrase);
			}
			
			const drillResult = this.drillFromSurface(phrase);
			if (drillResult === null)
				throw Exception.unknownState();
			
			if (!(drillResult instanceof ExplicitParallel))
				throw Exception.unknownState();
			
			return drillResult;
		}
		
		/** A call queue used to prevent circular drilling. */
		private readonly drillQueue: Phrase[] = [];
		
		/**
		 * "Raking" a Parallel is the process of deeply traversing it's
		 * Parallel Graph (depth first), and for each visited Parallel,
		 * deeply traversing it's Base Graph as well (also depth first).
		 * Through this double-traversal process, the Parallel's edges
		 * are constructed into a traversable graph.
		 */
		private rake(seed: Parallel)
		{
			// If the seed's container is null, this means that the seed
			// is root-level, and so it cannot have any Parallel types.
			// It may however have Base types, and these need to be
			// handled.
			if (seed.container === null)
			{
				if (!(seed instanceof ExplicitParallel))
					throw Exception.unknownState();
				
				this.rakeExplicitParallel(seed);
			}
			else this.rakeParallelGraph(seed);
			
			return seed;
		}
		
		/**
		 * Recursive function that digs through the parallel graph,
		 * and rakes all ExplicitParallels that are discovered.
		 */
		private rakeParallelGraph(par: Parallel)
		{
			for (const edgePar of par.getParallels())
				this.rakeParallelGraph(edgePar);
			
			if (par instanceof ExplicitParallel)
				this.rakeExplicitParallel(par);
		}
		
		/**
		 * Splitter method that rakes both a pattern and a non-pattern
		 * containing ExplicitParallel.
		 */
		private rakeExplicitParallel(par: ExplicitParallel)
		{
			par.pattern ?
				this.rakePatternBases(par) :
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
		private rakeBaseGraph(srcParallel: ExplicitParallel)
		{
			if (srcParallel.pattern)
				throw Exception.unknownState();
			
			if (this.rakedParallels.has(srcParallel))
				return;
			
			this.rakedParallels.add(srcParallel);
			
			for (const fork of srcParallel.phrase.outbounds)
			{
				if (this.cruft.has(fork))
					continue;
				
				const possibilities = fork.successors
					.filter(successor => !this.cruft.has(successor))
					.sort((a, b) => a.length - b.length);
				
				if (possibilities.length > 0)
				{
					// This is where the polymorphic name resolution algorithm
					// takes place. The algorithm operates by working it's way
					// up the list of nodes (aka the scope chain), looking for
					// a possible resolution target where the act of applying the
					// associated Parallel as a base, causes at least one of the 
					// conditions on the contract to be satisfied. Or, in the case
					// when there are no conditions on the contract, the node
					// that is the closest ancestor is used.
					for (const possibleSuccessor of possibilities)
					{
						const baseParallel = this.drillNonHypotheticalPhrase(possibleSuccessor);
						
						// baseParallel will be null in the case when a circular
						// relationship has been detected (and quitting is
						// required here in order to avoid a stack overflow).
						if (baseParallel === null)
							continue;
						
						this.rakeExplicitParallel(baseParallel);
						
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
						
						if (!srcParallel.tryAddLiteralBase(baseParallel, fork))
							continue;
						
						if (this.handledForks.has(fork))
							throw Exception.unknownState();
						
						this.handledForks.add(fork);
						continue;
					}
				}
				else
				{
					// At this point, we've discovered an annotation that we're
					// going to try to resolve as an alias. If this doesn't work,
					// the fork will be marked as cruft. Possibly a future version
					// of this compiler will allow other systems to hook into this
					// process and augment the resolution strategy.
					
					const patternParallelsInScope: ExplicitParallel[] = [];
					
					for (const { patternParallel } of this.ascend(srcParallel))
					{
						this.rakePatternBases(patternParallel);
						patternParallelsInScope.push(patternParallel);
					}
					
					if (patternParallelsInScope.length > 0)
					{
						const alias = fork.term.textContent;
						
						if (srcParallel.tryAddAliasedBase(patternParallelsInScope, fork, alias))
						{
							this.handledForks.add(fork);
							continue;
						}
					}
					
					if (!this.handledForks.has(fork))
						this.cruft.add(fork, Faults.UnresolvedAnnotation);
				}
			}
			
			if (!srcParallel.isContractSatisfied)
				for (const smt of srcParallel.phrase.statements)
					this.program.faults.report(new Fault(
						Faults.ContractViolation,
						smt));
			
			return srcParallel;
		}
		
		/**
		 * Finds the set of bases that should be applied to the provided
		 * pattern-containing ExplicitParallel instance, and attempts
		 * to have them applied.
		 */
		private rakePatternBases(patternParallel: ExplicitParallel)
		{
			if (!patternParallel.pattern)
				throw Exception.unknownState();
			
			if (this.rakedParallels.has(patternParallel))
				return;
			
			this.rakedParallels.add(patternParallel);
			
			const bases = new Map<ExplicitParallel, Fork>();
			const obs = patternParallel.phrase.outbounds;
			const nameOf = (fork: Fork) =>
				Subject.serializeInternal(fork.term);
			
			for (let i = -1; ++i < obs.length;)
			{
				const fork = obs[i];
				
				if (this.cruft.has(fork))
					continue;
				
				const len = fork.successors.length;
				
				// Because resolving pattern bases has non-polymorphic behavior, 
				// we can get away with checking for these faults here without going
				// through the whole drilling process.
				
				if (len === 0)
				{
					this.cruft.add(fork, Faults.UnresolvedAnnotation);
					continue;
				}
				
				if (obs.findIndex(e => nameOf(e) === nameOf(fork)) !== i)
				{
					this.cruft.add(fork, Faults.IgnoredAnnotation);
					continue;
				}
				
				if (len > 1)
					throw Exception.unknownState();
				
				const basePhrase = fork.successors[0];
				const baseParallel = this.drillNonHypotheticalPhrase(basePhrase);
				if (baseParallel !== null)
					bases.set(baseParallel, fork);
			}
			
			// Circular bases still need to be checked. It's unclear how and
			// where to actually do this, while factoring in the constraint
			// that these can be caused through the use of aliases.
			
			// Anything that is a list (with any dimensionality) needs to be
			// cut off, because these bases can't be applied to patterns.
			for (const [base, via] of bases)
				if (base.getListDimensionality() > 0)
					this.cruft.add(via, Faults.PatternMatchingList);
			
			// Now we need to determine if any of these bases are redundant.
			// This is done by checking to see if any of the bases are specified
			// somewhere in the base graph of all others.
			for (const [baseA] of bases)
				for (const [baseB, via] of bases)
					if (baseA !== baseB)
						if (baseA.hasBase(baseB))
							this.cruft.add(via, Faults.IgnoredAnnotation);
			
			const pattern = patternParallel.phrase.terminal as Pattern;
			const span = patternParallel.phrase.declarations.values().next().value as Span;
			const portInfixes = pattern.getInfixes(InfixFlags.portability);
			
			if (portInfixes.length > 0)
			{
				const validPortabilityInfixes: Infix[] = [];
				
				for (const portInfix of portInfixes)
				{
					const nfxAnnosIter = span.eachAnnotationForInfix(portInfix);
					const nfxAnnos = Array.from(nfxAnnosIter);
					
					if (nfxAnnos.length === 0)
						throw Exception.unknownState();
					
					// At this time, we're currently generating a fault in the case when
					// a portability infix has multiple definitions. Although the parser
					// and the Graph-level infrastructure supports this, more study is
					// required in order to determine if this is a characteristic of Truth.
					if (nfxAnnos.length > 1)
					{
						for (const nfx of nfxAnnos.slice(1))
							this.cruft.add(nfx, Faults.PortabilityInfixHasUnion);
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
			
			patternParallel.tryAddBasesToPattern(bases);
		}
		
		/**
		 * A generator function that works its way upwards, starting at the
		 * provided ExplicitParallel. The function yields the series of
		 * Parallels that contain Patterns that are visible to the provided
		 * srcParallel. The bases of these parallels have not necessarily
		 * been applied.
		 * 
		 * The ordering of the Parallels yielded is relevant. The instances
		 * that were yielded closer to the beginning take prescedence over
		 * the ones yielded at the end.
		 */
		private *ascend(srcParallel: ExplicitParallel)
		{
			const discoveredPatternPhrases = new Set<Phrase>();
			
			const yieldable = (patternPhrase: Phrase) =>
			{
				discoveredPatternPhrases.add(patternPhrase);
				
				return Not.null(
					this.parallels.getExplicit(patternPhrase) ||
					this.parallels.createExplicit(patternPhrase, this.cruft));
			};
			
			function *recurse(current: ExplicitParallel): IterableIterator<IPatternParallel>
			{
				for (const { base } of current.eachBase())
					yield *recurse(base);
				
				if (current instanceof ExplicitParallel)
				{
					for (const phrases of current.phrase.peekMany())
					{
						if (phrases.length !== 1)
							throw Exception.unexpectedHomograph();
						
						const phrase = phrases[0];
						
						if (phrase.terminal instanceof Pattern)
							if (!discoveredPatternPhrases.has(phrase))
								yield {
									pattern: phrase.terminal,
									patternParallel: yieldable(phrase)
								};
					}
				}
			}
			
			// The process starts at the container of the current parallel,
			// even though this function needs to yield other parallels that
			// are adjacent to srcParallel, because we reach back into the
			// adjacents from the container.
			for (let cur = srcParallel.container; cur instanceof ExplicitParallel;)
			{
				yield *recurse(cur);
				cur = cur.container;
			}
			
			function *yieldSurfacePatternsOfDocument(doc: Document)
			{
				for (const phrase of Phrase.rootsOf(doc))
					if (phrase.terminal instanceof Pattern)
						if (!discoveredPatternPhrases.has(phrase))
							yield {
								pattern: phrase.terminal,
								patternParallel: yieldable(phrase)
							};
			}
			
			// Be sure to yield the surface patterns of the document that
			// corresponds to srcParallel before moving upward to it's
			// dependency documents.
			const originDoc = srcParallel.phrase.containingDocument;
			yieldSurfacePatternsOfDocument(originDoc);
			
			for (const doc of originDoc.traverseDependencies())
				yieldSurfacePatternsOfDocument(doc);
		}
		
		/**
		 * Used for safety purposes to catch unexpected behavior.
		 */
		private readonly handledForks = new WeakSet<Fork>();
		
		/**
		 * Constructs and returns a new seed Parallel from the specified
		 * zenith Parallel, navigating downwards to the specified target subject.
		 */
		private descend(zenith: Parallel, targetSubject: Subject)
		{
			function followParallelsFn(par: Parallel)
			{
				const upperParallels = par.getParallels().slice();
				if (par instanceof ExplicitParallel)
					for (const { base } of par.eachBase())
						upperParallels.push(base);
				
				return upperParallels;
			};
			
			const hasExplicitContents = followParallelsFn(zenith)
				.some(p => p instanceof ExplicitParallel);
			
			// The following algorithm performs a recursive reduction on
			// the zenith, and produces a set of Parallels to prune from the
			// descension process. The Parallels that end up getting pruned
			// are the ones that, if unpruned, would result in a level that
			// has ImplicitParallels that shouldn't actually exist. For
			// example, consider the following document:
			//
			// Class
			// 
			// SubClass : Class
			// 	Child
			// 
			// "Class" should not have an ImplicitParallel called "Child",
			// because that was introduced in the derived "SubClass" type.
			// And so this algorithm stakes out cut off points so that we don't
			// blindly just descend all Parallels in the level.
			const prunedParallels = new Set<Parallel>();
			
			Misc.reduceRecursive(
				zenith,
				followParallelsFn,
				(current, results: readonly boolean[]) =>
				{
					const prune = 
						results.every(result => !result) &&
						!this.canDescendToExplicit(current, targetSubject);
					
					if (prune)
						prunedParallels.add(current);
					
					return !prune;
				});
			
			// In the case when the method is attempting to descend
			// to a level where there are no nodes whose name match
			// the type name specified (i.e. the whole level would be 
			// implicit parallels), null is returned because a descend
			// wouldn't make sense.
			if (!hasExplicitContents)
				return null;
			
			const descendParallelsFollowFn = (par: Parallel): readonly Parallel[] =>
			{
				if (!(par instanceof ExplicitParallel))
					return [];
				
				const bases = Array.from(par.eachBase())
					.map(entry => entry.base as Parallel)
					.slice();
				
				const result = bases
					.concat(par.getParallels())
					.filter(par => !prunedParallels.has(par));
				
				return result;
			};
			
			const seed = Misc.reduceRecursive(
				zenith,
				descendParallelsFollowFn,
				(current, nested: readonly Parallel[]) =>
				{
					const nextPar = this.descendOne(current, targetSubject);
					
					for (const edge of nested)
						nextPar.addParallel(edge);
					
					return nextPar;
				});
			
			return seed;
		}
		
		/**
		 * @returns A new ExplicitParallel or ImplicitParallel instance
		 * that corresponds to the specified zenith parallel.
		 */
		private descendOne(zenith: Parallel, targetSubject: Subject)
		{
			const nextPhrases = zenith.phrase.forward(targetSubject);
			
			if (nextPhrases.length === 0)
				throw Exception.unknownState();
			
			// TODO: We probably need to instead report a fault here
			// to indicate that homographs are only valid at the surface.
			if (nextPhrases.length > 1)
				throw Exception.unexpectedHomograph();
			
			const nextPhrase = nextPhrases[0];
			
			// In the case when we're descending from an ExplicitParallel (which
			// would be backed by a non-hypothetical phrase) to another phrase
			// that is also non-hypothetical, we need to run some verifications
			// on this decend operation which could generate faults.
			if (zenith instanceof ExplicitParallel && !nextPhrase.isHypothetical)
			{
				const out = 
					this.parallels.getExplicit(nextPhrase) ||
					this.parallels.createExplicit(nextPhrase, this.cruft);
					
				this.verifyDescend(zenith, out);
				return out;
			}
			
			return (
				this.parallels.get(nextPhrase) ||
				this.parallels.createImplicit(nextPhrase));
		}
		
		/**
		 * @returns A boolean value that indicates whether the act
		 * of descending from the specified Parallel to the typeName
		 * passed to the containing method would result in a
		 * ExplicitParallel instance.
		 */
		private canDescendToExplicit(parallel: Parallel, targetSubject: Subject)
		{
			return (
				parallel instanceof ExplicitParallel &&
				parallel.phrase.peek(targetSubject).length > 0);
		}
		
		/**
		 * Performs verification on the descend operation.
		 * Reports any faults that can occur during this process.
		 */
		private verifyDescend(
			zenithParallel: ExplicitParallel,
			descendParallel: ExplicitParallel)
		{
			if (descendParallel.phrase.terminal instanceof Anon)
				if (zenithParallel.phrase.isListIntrinsic)
					this.program.faults.report(new Fault(
						Faults.AnonymousInListIntrinsic,
						descendParallel.phrase.statements[0]));
		}
		
		/** */
		private readonly parallels = new ParallelCache();
		
		/**
		 * Stores the set of Parallel instances that have been "raked",
		 * which means that that have gone through the process of
		 * having their requested bases applied.
		 * 
		 * This set may include both pattern and non-patterns Parallels,
		 * (even though their raking processes are completely different).
		 */
		private rakedParallels = new WeakSet<Parallel>();
		
		/** */
		private readonly cruft: CruftCache;
	}
	
	/** */
	interface IPatternParallel
	{
		readonly pattern: Pattern;
		readonly patternParallel: ExplicitParallel;
	}
}
