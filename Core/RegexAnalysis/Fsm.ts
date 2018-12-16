import * as X from "../X";


/**
 * Oblivion is returns while `crawl()`ing an FSM if we transition to the
 * oblivion state. For example while crawling two FSMs in parallel we may
 * transition to the oblivion state of both FSMs at once. This warrants an
 * out-of-bound signal which will reduce the complexity of the new FSM's map.
 */
const Oblivion = Symbol();


/**
 * @internal
 * A Finite State Machine or FSM has an alphabet and a set of states. At any
 * given moment, the FSM is in one state. When passed a symbol from the
 * alphabet, the FSM jumps to another state (or possibly the same state).
 * A TransitionMap indicates where to jump. One state is nominated as the
 * initial state. Zero or more states are nominated as final states. If, after
 * consuming a string of symbols, the FSM is in a final state, then it is said
 * to "accept" the string.
 */
export class Fsm
{
	/** */
	constructor(
		/**
		 * An iterable of symbols the FSM can be fed.
		 */
		readonly alphabet: X.Alphabet,
		
		/**
		 * The set of possible states for the FSM.
		 */
		readonly states: ReadonlySet<number>,
		
		/**
		 * The initial state of the FSM.
		 */
		readonly initial: number,
		
		/**
		 * The set of states that the FSM accepts.
		 */
		readonly finals: ReadonlySet<number>,
		
		/**
		 * May be sparse (i.e. it may omit transitions). 
		 * In the case of omitted transitions, a non-final
		 * "oblivion" state is simulated.
		 */
		readonly transitions: X.TransitionMap)
	{ }
	
	/**
	 * @returns A boolean value that indicates whether the present FSM
	 * accepts the supplied array of symbols. Equivalently, consider this
	 * FSM instance as a possibly-infinite set of strings and test whether
	 * the input is a member of it.
	 * 
	 * If the Wildcard is present in the specified alphabet, then any symbol
	 * not in the specified alphabet will be converted to a Wildcard.
	 */
	accepts(input: string)
	{
		const thisHasWild = this.alphabet.hasWild();
		let stateId = this.initial;
		
		for (const char of input)
		{
			const symbol = thisHasWild && !this.alphabet.has(char) ?
				X.Alphabet.wild :
				char;
			
			// Missing transition = transition to dead state
			if (!this.transitions.has(stateId, symbol))
				return false;
			
			const newStateId = this.transitions.get(stateId, symbol);
			if (newStateId === undefined)
				throw new ReferenceError();
			
			stateId = newStateId;
		}
		
		return this.finals.has(stateId);
	}
	
	/**
	 * Reduces the FSM to a minimal finite state machine equivalent.
	 * 
	 * (A result by Brzozowski (1963) shows that a minimal finite state
	 * machine equivalent to the original can be obtained by reversing
	 * the original twice.)
	 */
	reduce()
	{
		return this.reverse().reverse();
	}
	
	/**
	 * Concatenate a series of finite state machines together.
	 */
	concatenate(...fsms: Fsm[])
	{
		if (fsms.length === 0)
			quit(new RangeError());
		
		if (fsms.length === 1)
			return fsms[0];
		
		const alphabet = new X.Alphabet(...fsms.map(fsm => fsm.alphabet))
		
		/**
		 * Take a state in the numbered FSM and return a set containing it, plus
		 * (if it's final) the first state from the next FSM, plus (if that's
		 * final) the first state from the next but one FSM, plus...
		 */
		const connectAll = (idx: number, substateId: number) =>
		{
			const result = new X.Guide();
			result.add(idx, substateId);
			
			while (idx < fsms.length - 1 && fsms[idx].finals.has(substateId))
			{
				idx++;
				substateId = fsms[idx].initial;
				result.add(idx, substateId);
			}
			
			return result;
		}
		
		/**
		 * Use a superset containing states from all FSMs at once.
		 * We start at the start of the first FSM. If this state is final in the
		 * first FSM, then we are also at the start of the second FSM. And so on.
		 */
		const initial = new X.Guide();
		
		if (fsms.length > 0)
			initial.append(connectAll(0, fsms[0].initial));
		
		/**
		 * If you're in a final state of the final FSM, it's final.
		 */
		const final = (guide: X.Guide) =>
		{
			for (const [i, substate] of guide.entries())
				if (i === fsms.length - 1 && fsms[i].finals.has(substate))
					return true;
			
			return false;
		}
		
		/** */
		const follow: TFollowFn = (guide: X.Guide, symbol: string) =>
		{
			const next = new X.Guide();
			
			for (const [i, substate] of guide.entries())
			{
				const fsm = fsms[i];
				
				if (fsm.transitions.has(substate, symbol))
				{
					const storedValue = fsm.transitions.acquire(substate, symbol);
					next.append(connectAll(i, storedValue));
				}
			}
			
			if (next.size === 0)
				return Oblivion;
			
			return next;
		}
		
		return crawl(alphabet, initial, final, follow);
	}
	
	
	/**
	 * Concatenate two finite state machines together.
	 * For example, if this accepts "0*" and other accepts "1+(0|1)",
	 * will return a finite state machine accepting "0*1+(0|1)".
	 * Accomplished by effectively following non-deterministically.
	 */
	add(other: Fsm)
	{
		return this.concatenate(this, other);
	}
	
	/**
	 * If the present FSM accepts X, returns an FSM accepting X*
	 * (i.e. 0 or more instances of X). Note that this is not as simple
	 * as naively connecting the final states back to the initial state: 
	 * see (b*ab)* for example.
	 */
	star()
	{
		const alphabet = this.alphabet;
		const initial = new X.Guide(this.initial);
		
		const follow: TFollowFn = (guide: X.Guide, symbol: string) =>
		{
			const next = new X.Guide();
			
			for (const substate of guide.keys())
			{
				if (this.transitions.has(substate, symbol))
					next.add(this.transitions.acquire(substate, symbol));
				
				// If one of our substates is final, then we can also consider
				// transitions from the initial state of the original FSM.
				if (this.finals.has(substate) && this.transitions.has(this.initial, symbol))
					next.add(this.transitions.acquire(this.initial, symbol));
			}
			
			if (next.size === 0)
				return Oblivion;
			
			return next;
		}
		
		const final: TFinalFn = (guide: X.Guide) =>
		{
			for (const substate of guide.keys())
				if (this.finals.has(substate))
					return true;
			
			return false;
		}
		
		return crawl(alphabet, initial, final, follow).or(epsilon(alphabet));
	}
	
	/**
	 * Given an FSM and a multiplication factor, return the multiplied FSM.
	 */
	multiply(factor: number)
	{
		if (factor < 0)
			return quit(new RangeError());
		
		const alphabet = this.alphabet;
		const initial = new X.Guide([[this.initial, 0]]);
		
		const final: TFinalFn = guide =>
		{
			for (const [substate, iteration] of guide.entries())
				if (this.initial === substate)
					if (this.finals.has(this.initial) || iteration === factor)
						return true;
			
			return false;
		}
		
		const follow: TFollowFn = (guide: X.Guide, symbol: string) =>
		{
			const next = new X.Guide();
			
			for (const [substate, iteration] of guide.entries())
			{
				if (iteration < factor && this.transitions.has(substate, symbol))
				{
					const num = this.transitions.acquire(substate, symbol);
					next.add(num, iteration);
					
					if (this.finals.has(num))
						next.add(this.initial, iteration + 1);
				}
			}
			
			if (next.size === 0)
				return Oblivion;
			
			return next;
		}
		
		return crawl(alphabet, initial, final, follow).reduce();
	}
	
	/**
	 * @returns A new Fsm object that presents the union of
	 * all supplied Fsm instances.
	 */
	union(...fsms: Fsm[])
	{
		return parallelCrawl(fsms, accepts => accepts.some(val => val));
	}
	
	/**
	 * Performs logical alternation between this Fsm, and the Fsm
	 * instance supplied in the argument.
	 * 
	 * @returns A finite state machine which accepts any sequence of
	 * symbols that is accepted by either self or other. Note that the set
	 * of strings recognised by the two FSMs undergoes a set union.
	 */
	or(other: Fsm)
	{
		return this.union(other);
	}
	
	/**
	 * @returns A new Fsm object that represents the
	 * intersection of all supplied Fsm instances.
	 */
	intersection(...fsms: Fsm[])
	{
		return parallelCrawl(fsms, accepts => accepts.every(val => val));
	}
	
	/**
	 * Treat the FSMs as sets of strings and return the
	 * intersection of those sets in the form of a new FSM.
	 */
	and(other: Fsm)
	{
		return this.intersection(other);
	}
	
	/**
	 * @returns A new Fsm object that represents the computed
	 * symmetric difference of all suppled Fsm instances.
	 */
	symmetricDifference(...fsms: Fsm[])
	{
		return parallelCrawl(fsms, accepts => (accepts.filter(val => val).length % 2) === 1);
	}
	
	/**
	 * @returns A new Fsm instances that recognises only the strings
	 * recognised by this Fsm, or the Fsm instance supplied in the 
	 * other argument, but not both.
	 */
	xor(other: Fsm)
	{
		return this.symmetricDifference(other);
	}
	
	/**
	 * @returns A new Fsm instance that recogizes all inputs that
	 * would not be accepted by this Fsm.
	 */
	not()
	{
		const alphabet = this.alphabet;
		const initial = new X.Guide([[0, this.initial]]);
		
		const follow: TFollowFn = (guide: X.Guide, symbol: string) =>
		{
			const next = new X.Guide();
			const first = guide.first();
			
			if (first !== undefined)
				if (this.transitions.has(first, symbol))
					next.add(0, this.transitions.get(first, symbol));
			
			return next;
		}
		
		const final: TFinalFn = guide =>
		{
			const first = guide.first();
			return !(first !== undefined && this.finals.has(first));
		}
		
		return crawl(alphabet, initial, final, follow);
	}
	
	/**
	 * @returns A new Fsm such that for every input that the supplied
	 * Fsm accepts, the new Fsm accepts the same input, but reversed.
	 */
	reverse()
	{
		const alphabet = this.alphabet;
		
		// Start from a composite "state-set" consisting of all final states.
		// If there are no final states, this set is empty and we'll find that
		// no other states get generated.
		const initial = new X.Guide();
		
		for (const stateId of this.finals)
			initial.add(stateId);
		
		// Find every possible way to reach the current state-set
		// using this symbol.
		const follow: TFollowFn = (guide: X.Guide, symbol: string) =>
		{
			const next = new X.Guide();
			
			for (const prevStateId of this.transitions.eachStateId())
				for (const stateId of guide.keys())
					if (this.transitions.has(prevStateId, symbol))
						if (this.transitions.get(prevStateId, symbol) === stateId)
							next.add(prevStateId);
			
			return next.size === 0 ?
				Oblivion :
				guide;
		}
		
		const final: TFinalFn = state =>
		{
			return state.has(this.initial);
		}
		
		return crawl(alphabet, initial, final, follow);
	}
	
	/**
	 * @returns A boolean value indicating whether this Fsm instance
	 * accepts the same set of inputs as the Fsm instance specified
	 * in the argument.
	 */
	equivalent(other: Fsm)
	{
		return this.xor(other).isEmpty();
	}
	
	/**
	 * @returns A boolean value indicating whether this Fsm instance
	 * does not accept the same set of inputs as the Fsm instance
	 * specified in the argument.
	 */
	unequivalent(other: Fsm)
	{
		return !(this.xor(other).isEmpty());
	}
	
	/**
	 * @returns An Fsm instance which recognises only the inputs
	 * recognised by the first Fsm instance in the list, but none of 
	 * the others.
	 */
	difference(...fsms: Fsm[])
	{
		return parallelCrawl(
			fsms,
			accepts => accepts[0] && accepts.slice(1).every(accepts => !accepts));
	}
	
	/**
	 * @returns A boolean value that indicates whether a final state
	 * can be reached from the specified state.
	 */
	isStateLive(stateId: number)
	{
		const reachable = [stateId];
		
		for (let i = -1; ++i < reachable.length;)
		{
			const currentStateId = reachable[i];
			
			if (this.finals.has(currentStateId))
				return true;
			
			if (this.transitions.has(currentStateId))
			{
				const transitionState = this.transitions.acquire(currentStateId);
				for (const symbol of transitionState.eachSymbol())
				{
					const next = this.transitions.acquire(currentStateId, symbol);
					if (!reachable.includes(next))
						reachable.push(next);
				}
			}
		}
		
		return false;
	}
	
	/**
	 * An FSM is empty if it recognises no strings. An FSM may be arbitrarily
	 * complicated and have arbitrarily many final states while still recognising
	 * no strings because those final states may all be inaccessible from the
	 * initial state. Equally, an FSM may be non-empty despite having an empty
	 * alphabet if the initial state is final.
	 */
	isEmpty()
	{
		return !this.isStateLive(this.initial);
	}
	
	/**
	 * Generate strings (lists of symbols) that this FSM accepts. Since there may
	 * be infinitely many of these we use a generator instead of constructing a
	 * static list. Strings will be sorted in order of length and then lexically.
	 * This procedure uses arbitrary amounts of memory but is very fast. There
	 * may be more efficient ways to do this, that I haven't investigated yet.
	 * You can use this in list comprehensions.
	 */
	*eachString()
	{
		"Not implemented";
		debugger;
		yield "";
	}
	
	/**
	 * @returns A boolean value that indicates whether the act of merging
	 * this Fsm instance with the Fsm instance supplied in the argument
	 * would result in an Fsm instance that accepts no inputs.
	 */
	isDiscrepant(other: Fsm)
	{
		return this.and(other).isEmpty();
	}
	
	/**
	 * @returns A boolean value that indicates whether the set of inputs
	 * accepted by this Fsm instance is a subset of the inputs accepted by 
	 * other Fsm instance specified.
	 */
	isSubset(other: Fsm)
	{
		return this.difference(other).isEmpty();
	}
	
	/**
	 * @returns A boolean value that indicates whether the set of inputs
	 * accepted by this Fsm instance is a proper subset of the inputs
	 * accepted by other Fsm instance specified.
	 */
	isProperSubset(other: Fsm)
	{
		return this.difference(other).isEmpty() && this.unequivalent(other);
	}
	
	/**
	 * @returns A boolean value that indicates whether the set of inputs
	 * accepted by this Fsm instance is a superset of the inputs accepted
	 * by other Fsm instance specified.
	 */
	isSuperset(other: Fsm)
	{
		return other.difference(this).isEmpty();
	}
	
	/**
	 * @returns A boolean value that indicates whether the set of inputs
	 * accepted by this Fsm instance is a proper superset of the inputs
	 * accepted by other Fsm instance specified.
	 */
	isProperSuperset(other: Fsm)
	{
		return other.difference(this).isEmpty() && other.unequivalent(this);
	}
	
	/**
	 * Compute the Brzozowski derivative of this FSM with respect to the input
	 * string of symbols. <https://en.wikipedia.org/wiki/Brzozowski_derivative>
	 * If any of the symbols are not members of the alphabet, that's a KeyError.
	 * If you fall into oblivion, then the derivative is an FSM accepting no
	 * strings.
	 * 
	 * @returns A new Fsm instance with the computed characteristics.
	 */
	derive(input: string)
	{
		let stateId: number = this.initial;
		
		for (let char of input)
		{
			const symbol = (() =>
			{
				if (this.alphabet.has(char))
				{
					if (!(this.alphabet.hasWild))
						return quit(new Error(char));
					
					return X.Alphabet.wild;
				}
				
				return char;
			})();
			
			if (!this.transitions.has(stateId, symbol))
				return Oblivion;
			
			stateId = this.transitions.acquire(stateId, symbol);
		}
		
		return new Fsm(
			this.alphabet.clone(),
			this.states,
			stateId,
			this.finals,
			this.transitions.clone());
	}
}


/**
 * @returns A new Fsm instance that accept
 * no inputs, not even an empty string.
 */
function nil(alphabet: X.Alphabet)
{
	const tsl: X.ITransitionStateLiteral = {};
	
	for (const symbol of alphabet)
		tsl[symbol] = 0;
	
	return new Fsm(
		alphabet,
		new Set([0]),
		0,
		new Set(),
		new X.TransitionMap({ 0: tsl }));
}


/**
 * @returns An Fsm that matches only an empty string.
 */
function epsilon(alphabet: X.Alphabet)
{
	return new Fsm(
		alphabet,
		new Set([0]),
		0,
		new Set([0]),
		new X.TransitionMap());
}


/**
 * Crawl several FSMs in parallel, mapping the states of a larger meta-FSM.
 * To determine whether a state in the larger FSM is final, pass all of the
 * finality statuses (e.g. [true, false, false] to testFn.
 */
function parallelCrawl(fsms: Fsm[], testFn: (accepts: boolean[]) => boolean)
{
	const alphabet = new X.Alphabet(...fsms.map(fsm => fsm.alphabet));
	
	const initial = new X.Guide();
	
	for (const [index, fsm]  of fsms.entries())
		initial.add(index, fsm.initial);
	
	/**
	 * Dedicated function accepts a "superset" and returns the next "superset"
	 * obtained by following this transition in the new FSM.
	 */
	const follow: TFollowFn = (guide: X.Guide, symbol: string) =>
	{
		const next = new X.Guide();
		
		for (const [index, fsm] of fsms.entries())
		{
			const stateId = guide.get(index);
			if (stateId == null)
				continue;
			
			const substateId = fsm.transitions.get(stateId);
			if (substateId == undefined)
				continue;
			
			const alpha = fsm.alphabet;
			const actualSymbol = alpha.has(symbol) && alpha.hasWild() ?
				X.Alphabet.wild :
				symbol;
			
			if (substateId.has(actualSymbol))
				next.add(index, fsm.transitions.get(stateId, actualSymbol));
		}
		
		if (next.size === 0)
			return Oblivion;
		
		return next;
	}
	
	/**
	 * Determine the "is final?" condition of each substate, then pass it to the
	 * test to determine finality of the overall FSM.
	 */
	const final: TFinalFn = guide =>
	{
		const accepts: boolean[] = [];
		
		for (const [idx, fsm] of fsms.entries())
		{
			const substateId = guide.get(idx);
			if (substateId != null)
				accepts.push(guide.has(idx) && fsm.finals.has(substateId));
		}
		
		return testFn(accepts);
	}
	
	return crawl(alphabet, initial, final, follow);
}


/**
 * Given the above conditions and instructions, crawl a new unknown FSM,
 * mapping its states, final states and transitions. Return the new FSM.
 */
function crawl(
	alphabet: X.Alphabet,
	initial: X.Guide,
	finalFn: TFinalFn,
	followFn: TFollowFn)
{
	const states = [initial];
	const finals = new Set<number>();
	const transitions = new X.MutableTransitionMap();
	
	// Iterate over a growing list
	for (let i = 0; i < states.length; i++)
	{
		const state = states[i];
		
		// Add to finals
		if (finalFn(state))
			finals.add(i);
		
		// Compute transitions for this state
		for (const symbol of alphabet)
		{
			const next = followFn(state, symbol);
			if (next === Oblivion)
				continue;
			
			const nextIdx = states.indexOf(next);
			
			const n = nextIdx < 0 ?
				states.length :
				nextIdx;
			
			transitions.set(i, symbol, n);
		}
	}
	
	return new Fsm(
		alphabet,
		new Set(Array(states.length).keys()),
		0,
		finals,
		transitions);
}


/** */
function quit(error?: Error | string): never
{
	debugger;
	throw error;
}


/** */
type TFollowFn = (guide: X.Guide, symbol: string) => X.Guide | typeof Oblivion;

/** */
type TFinalFn = (guide: X.Guide) => boolean;
