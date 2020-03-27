
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
		constructor(
			private readonly program: Program,
			private readonly phraseProvider: PhraseProvider)
		{
			this.cruft = new CruftCache(this.program);
		}
		
		/**
		 * Constructs the corresponding Parallel instances for
		 * all explicit types that exist within the provided Document,
		 * or below the provided ExplicitParallel.
		 */
		excavate(from: Document | ExplicitParallel)
		{
			if (this.excavated.has(from.id))
				return;
			
			this.excavated.add(from.id);
			const queue: ExplicitParallel[] = [];
			
			if (from instanceof Document)
			{
				for (const phrase of Phrase.rootsOf(from))
				{
					const drilledParallel = this.drillSafely(phrase);
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
					const drilledParallel = this.drillSafely(phrase);
					if (drilledParallel !== null)
						queue.push(drilledParallel);
				}
			}
		}
		
		/**
		 * Carries out a drilling operation, beginning at the top-most ancestor
		 * of the directive phrase provided, and descending downward.
		 */
		drill(directive: Phrase)
		{
			if (this.parallels.has(directive))
				return Not.undefined(this.parallels.get(directive));
			
			if (directive.length === 0)
				throw Exception.invalidArgument();
			
			const ancestry = directive.ancestry;
			const surfacePhrase = directive.ancestry[0];
			
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
		 * This method invokes the .drill() method, but does so in
		 * a way that detects the calls being made, in order to prevent
		 * circular invokations. Circular invokations can otherwise
		 * happen in the case when the provided document actually
		 * has a circular base reference. If the system were to simply
		 * follow this blindly, it would drill in circularity indefinitely.
		 * 
		 * The method returns null instead of a parallel in the case
		 * when a circular base is detected.
		 */
		private drillSafely(phrase: Phrase)
		{
			if (phrase.isHypothetical)
				throw Exception.unknownState();
			
			// In the case when we've begun to drill a phrase that
			// exists at a higher level than the where the drilling
			// process has previously been operating, the drill
			// queue is cleared out because it's no longer relevant.
			if (this.drillQueueParent !== phrase.parent.id)
			{
				this.drillQueue.clear();
				this.drillQueue.add(phrase.id);
				this.drillQueueParent = phrase.parent.id;
			}
			// Circular drilling is only a problem if we're drilling
			// phrases that reference each other that are on the
			// same level.
			else if (this.drillQueue.has(phrase.id))
			{
				return null;
			}
			
			const drillResult = this.drill(phrase);
			if (drillResult === null)
				throw Exception.unknownState();
			
			if (!(drillResult instanceof ExplicitParallel))
				throw Exception.unknownState();
			
			this.drillQueue.delete(phrase.id);
			return drillResult;
		}
		
		/** A call queue used to prevent circular drilling. */
		private readonly drillQueue = new Set<number>();
		private drillQueueParent = -1;
		
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
		 * bases as faults. This is because polymorphic type resolution
		 * needs to take place before the system can be sure that a 
		 * seemingly-circular base structure is in fact what it seems.
		 * True circular base detection is therefore handled at a future
		 * point in the pipeline.
		 */
		private rakeBaseGraph(srcParallel: ExplicitParallel)
		{
			if (srcParallel.pattern)
				throw Exception.unknownState();
			
			if (this.rakedParallels.has(srcParallel.id))
				return;
			
			this.rakedParallels.add(srcParallel.id);
			
			// The type resolution algorithm operates by resolving all literal
			// types first, and then in the case when there are unresolved 
			// forks left over, attempting to resolve one of these as an alias.
			const unresolvedForks: Fork[] = [];
			
			for (const fork of srcParallel.phrase.outbounds)
			{
				if (this.cruft.has(fork))
					continue;
				
				const possibilities = fork.successors
					.filter(successor => !this.cruft.has(successor))
					.sort((a, b) => a.length - b.length);
				
				// Found a fork to nowhere. It may be an alias, which will
				// be investigated momentarily, but for now, it's marked
				// as unresolved.
				if (possibilities.length === 0)
				{
					unresolvedForks.push(fork);
					continue;
				}
				
				// This is where the polymorphic type resolution algorithm
				// takes place. The algorithm operates by working it's way
				// up the list of nodes (aka the scope chain), looking for
				// a possible resolution target where the act of applying the
				// associated Parallel as a base, causes at least one of the 
				// conditions on the contract to be satisfied. Or, in the case
				// when there are no conditions on the contract, the node
				// that is the closest ancestor is used.
				for (const possibleSuccessor of possibilities)
				{
					const baseParallel = this.drillSafely(possibleSuccessor);
					
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
					
					const result = srcParallel.tryAddLiteralBase(baseParallel, fork);
					if (result === BaseResolveResult.rejected)
						continue;
					
					if (this.handledForks.has(fork.id))
						throw Exception.unknownState();
					
					this.handledForks.add(fork.id);
					break;
				}
			}
			
			// At this point, we've discovered forks that weren't able
			// to be resolved as literals, and so we're going to attempt
			// to perform resolution by alias. If this doesn't work,
			// the fork will be marked as cruft.
			for (const [idx, fork] of unresolvedForks.entries())
			{
				const patternParallelsInScope = new Set<ExplicitParallel>();
				
				for (const { patternParallel } of this.ascend(srcParallel))
				{
					this.rakePatternBases(patternParallel);
					patternParallelsInScope.add(patternParallel);
				}
				
				if (patternParallelsInScope.size > 0)
				{
					const alias = fork.term.textContent;
					const result = srcParallel.tryAddAliasedBase(
							patternParallelsInScope,
							fork,
							alias);
						
					if (result !== BaseResolveResult.rejected)
					{
						unresolvedForks.splice(idx, 1);
						
						// Even if a fork is considered "handled", this still doesn't mean it's free
						// of faults. It could still have another fault on it, just one that was added
						// by some other means. "Handled" is only used to determine if we need
						// to report an unresolved annotation fault.
						this.handledForks.add(fork.id);
						break;
					}
				}
			}
			
			// Only one fork is ever interpreted as the alias. Other remaining
			// forks are considered unresolved annotations.
			for (const fork of unresolvedForks)
				if (!this.handledForks.has(fork.id))
					this.cruft.add(fork, Faults.UnresolvedAnnotation);
			
			// Only report contract violation faults in the case when there are
			// no other faults reported on any of the annotation spans. If any of
			// annotations are faulty, technically it isn't knowable whether the
			// contract has been violated (and the report just looks like noise).
			if (srcParallel.phrase.annotations.every(span => !this.cruft.has(span)))
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
			
			if (this.rakedParallels.has(patternParallel.id))
				return;
			
			this.rakedParallels.add(patternParallel.id);
			
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
				const baseParallel = this.drillSafely(basePhrase);
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
			yield *yieldSurfacePatternsOfDocument(originDoc);
			
			for (const doc of originDoc.traverseDependencies())
				yield *yieldSurfacePatternsOfDocument(doc);
		}
		
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
			const hasExplicitContainees = Misc.reduceRecursive(
				zenith,
				followParallelsFn,
				(current, results: readonly boolean[]) =>
				{
					if (results.every(result => !result))
					{
						if (current instanceof ImplicitParallel || 
							current.phrase.peek(targetSubject).length === 0)
						{
							prunedParallels.add(current);
							return false;
						}
					}
					
					return true;
				});
			
			// In the case when the method is attempting to descend
			// to a level where there are no nodes whose name match
			// the type name specified (i.e. the whole level would be 
			// implicit parallels), null is returned because a descend
			// wouldn't make sense.
			if (!hasExplicitContainees)
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
			const nextPhrases = this.phraseProvider.forward(zenith, targetSubject);
			
			if (nextPhrases.length === 0)
				throw Exception.unknownState();
			
			// Bogus homographs should have already been pruned by
			// the time we get to this point.
			if (nextPhrases.length > 1)
				for (const nextPhrase of nextPhrases)
					for (const smt of nextPhrase.statements)
						this.program.faults.report(new Fault(
							Faults.UnexpectedHomograph,
							smt));
			
			const nextPhrase = nextPhrases[0];
			
			// In the case when we're descending from an ExplicitParallel (which
			// would be backed by a non-hypothetical phrase) to another phrase
			// that is also non-hypothetical, we need to run some verifications
			// on this decend operation which could generate faults.
			if (zenith instanceof ExplicitParallel && !nextPhrase.isHypothetical)
			{
				const descendTarget = 
					this.parallels.getExplicit(nextPhrase) ||
					this.parallels.createExplicit(nextPhrase, this.cruft);
				
				if (descendTarget.phrase.terminal === Term.anonymous)
					if (zenith.phrase.isListIntrinsic)
						for (const smt of descendTarget.phrase.statements)
							this.program.faults.report(new Fault(
								Faults.AnonymousInListIntrinsic,
								smt));
				
				return descendTarget;
			}
			
			return (
				this.parallels.get(nextPhrase) ||
				this.parallels.createImplicit(nextPhrase));
		}
		
		/**
		 * Resets all memory within this ConstructionWorker instance.
		 */
		reset()
		{
			this.excavated.clear();
			this.cruft.clear();
			this.parallels.clear();
			this.handledForks.clear();
			this.rakedParallels.clear();
			
			// Safety
			this.drillQueue.clear();
		}
		
		/**
		 * Stores the IDs of the ExplicitParallels and Documents that have been
		 * fully excavated.
		 */
		private readonly excavated = new Set<number>();
		
		/** */
		private readonly parallels = new ParallelCache();
		
		/**
		 * Stores the IDs that correspond to the Parallel instances that 
		 * have been "raked", which means that that have gone through
		 * the process of having their requested bases applied.
		 * 
		 * This set may include the IDs of both pattern and non-pattern Parallels,
		 * (even though their raking processes are completely different).
		 */
		private readonly rakedParallels = new Set<number>();
		
		/**
		 * 
		 */
		private readonly handledForks = new Set<number>();
		
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
