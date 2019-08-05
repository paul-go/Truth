import * as X from "../X";


/**
 * This code is a TypeScript conversion of a portion of the the Python
 * project "greenery", from GitHub user "qntm". 
 * 
 * The greenery project can be found here:
 * https://github.com/qntm/greenery
 * 
 * Specifically, the code from where this code drew inspiration is:
 * https://github.com/qntm/greenery/blob/master/greenery/fsm.py
 * 
 * Possibly relevant blog post:
 * https://qntm.org/algo
 * 
 * The original MIT license from greenery is as follows:
 * 
 * Copyright (C) 2012 to 2017 by qntm
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */


/**
 * Oblivion is a Symbol object that is returned while calling crawl() if the Fsm
 * is transitioned to the oblivion state. For example while crawling two Fsms
 * in parallel we may transition to the oblivion state of both Fsms at once.
 * This warrants an out-of-bound signal which will reduce the complexity of
 * the new Fsm's map.
 */
const Oblivion = Symbol();


/**
 * @internal
 * A Finite State Machine or Fsm has an alphabet and a set of states. At any
 * given moment, the Fsm is in one state. When passed a symbol from the
 * alphabet, the Fsm jumps to another state (or possibly the same state).
 * A TransitionMap indicates where to jump. One state is nominated as the
 * initial state. Zero or more states are nominated as final states. If, after
 * consuming a string of symbols, the Fsm is in a final state, then it is said
 * to "accept" the string.
 */
export class Fsm
{
	/**
	 * @returns A new Fsm instance that accept
	 * no inputs, not even an empty string.
	 */
	static empty(alphabet: X.Alphabet)
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
	static epsilon(alphabet: X.Alphabet)
	{
		return new Fsm(
			alphabet,
			new Set([0]),
			0,
			new Set([0]),
			new X.TransitionMap());
	}
	
	/** */
	constructor(
		/**
		 * An iterable of symbols the Fsm can be fed.
		 */
		readonly alphabet: X.Alphabet,
		
		/**
		 * The set of possible states for the Fsm.
		 */
		readonly states: ReadonlySet<number>,
		
		/**
		 * The initial state of the Fsm.
		 */
		readonly initial: number,
		
		/**
		 * The set of states that the Fsm accepts.
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
	 * @returns A boolean value that indicates whether the present Fsm
	 * accepts the supplied array of symbols. Equivalently, consider this
	 * Fsm instance as a possibly-infinite set of strings and test whether
	 * the input is a member of it.
	 * 
	 * If the wildcard character is present in the specified alphabet, then
	 * any symbol not in the specified alphabet will be assumed to be 
	 * wildcard.
	 */
	accepts(input: string)
	{
		const thisHasWild = this.alphabet.hasWildcard();
		let stateId = this.initial;
		
		for (const char of input)
		{
			const symbol = thisHasWild && !this.alphabet.has(char) ?
				X.Alphabet.wildcard :
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
	 * @returns A reduced version of the Fsm, down to a minimal finite
	 * state machine equivalent.
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
	 * @returns A new Fsm instance that represents the concatenation
	 * of the specified series of finite state machines.
	 */
	concatenate(...fsms: Fsm[])
	{
		if (fsms.length === 0)
			throw new RangeError();
		
		if (fsms.length === 1)
			return fsms[0];
		
		/**
		 * Take a state in the numbered Fsm and return a set containing it,
		 * plus (if it's final) the first state from the next Fsm, 
		 * plus (if that's final) the first state from the next but one Fsm, 
		 * plus...
		 */
		const connectAll = (idx: number, substateId: number) =>
		{
			const result = new X.Guide();
			result.add(idx, substateId);
			
			let i = idx;
			let id = substateId;
			
			while (i < fsms.length - 1 && fsms[i].finals.has(id))
			{
				i++;
				id = fsms[i].initial;
				result.add(i, id);
			}
			
			return result;
		};
		
		/**
		 * Use a superset containing states from all Fsms at once.
		 * We start at the start of the first Fsm. If this state is final in the
		 * first Fsm, then we are also at the start of the second Fsm. And so on.
		 */
		const initial = new X.Guide();
		
		if (fsms.length > 0)
			initial.append(connectAll(0, fsms[0].initial));
		
		/**
		 * If you're in a final state of the final Fsm, it's final.
		 */
		const finalFn = (guide: X.Guide) =>
		{
			for (const [i, substateId] of guide.entries())
				if (i === fsms.length - 1 && fsms[i].finals.has(substateId))
					return true;
			
			return false;
		};
		
		/** */
		const followFn = (guide: X.Guide, symbol: string) =>
		{
			const next = new X.Guide();
			
			for (const [i, substateId] of guide.entries())
			{
				const fsm = fsms[i];
				
				if (fsm.transitions.has(substateId, symbol))
				{
					const storedValue = fsm.transitions.acquire(substateId, symbol);
					next.append(connectAll(i, storedValue));
				}
			}
			
			return next.size === 0 ?
				Oblivion :
				next;
		};
		
		const alphabets = fsms.map(fsm => fsm.alphabet);
		const alphabet = new X.AlphabetBuilder(...alphabets).toAlphabet();
		
		return crawl(alphabet, initial, finalFn, followFn);
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
	 * If the present Fsm accepts X, returns an Fsm accepting X*
	 * (i.e. 0 or more instances of X). Note that this is not as simple
	 * as naively connecting the final states back to the initial state: 
	 * see (b*ab)* for example.
	 */
	star()
	{
		const initial = new X.Guide(this.initial);
		
		/** */
		const followFn = (guide: X.Guide, symbol: string) =>
		{
			const next = new X.Guide();
			
			for (const substateId of guide.keys())
			{
				if (this.transitions.has(substateId, symbol))
					next.add(this.transitions.acquire(substateId, symbol));
				
				// If one of our substates is final, then we can also consider
				// transitions from the initial state of the original Fsm.
				if (this.finals.has(substateId) && this.transitions.has(this.initial, symbol))
					next.add(this.transitions.acquire(this.initial, symbol));
			}
			
			return next.size === 0 ?
				Oblivion :
				next;
		};
		
		/** */
		const finalFn = (guide: X.Guide) =>
		{
			for (const substateId of guide.keys())
				if (this.finals.has(substateId))
					return true;
			
			return false;
		};
		
		return crawl(this.alphabet, initial, finalFn, followFn).or(Fsm.epsilon(this.alphabet));
	}
	
	/**
	 * Given an Fsm and a multiplication factor, return the multiplied Fsm.
	 */
	multiply(factor: number)
	{
		if (factor < 0)
			throw new RangeError();
		
		const initial = new X.Guide([[this.initial, 0]]);
		
		/** */
		const finalFn = (guide: X.Guide) =>
		{
			for (const [substateId, iteration] of guide.entries())
				if (this.initial === substateId)
					if (this.finals.has(this.initial) || iteration === factor)
						return true;
			
			return false;
		};
		
		/** */
		const followFn = (guide: X.Guide, symbol: string) =>
		{
			const next = new X.Guide();
			
			for (const [substateId, iteration] of guide.entries())
			{
				if (iteration < factor && this.transitions.has(substateId, symbol))
				{
					const num = this.transitions.acquire(substateId, symbol);
					next.add(num, iteration);
					
					if (this.finals.has(num))
						next.add(this.initial, iteration + 1);
				}
			}
			
			if (next.size === 0)
				return Oblivion;
			
			return next;
		};
		
		return crawl(this.alphabet, initial, finalFn, followFn).reduce();
	}
	
	/**
	 * @returns A new Fsm object that presents the union of
	 * all supplied Fsm instances.
	 */
	union(...fsms: Fsm[])
	{
		return crawlParallel(
			prependFsm(this, fsms), 
			accepts => accepts.some(val => val));
	}
	
	/**
	 * Performs logical alternation between this Fsm, and the Fsm
	 * instance supplied in the argument.
	 * 
	 * @returns A finite state machine which accepts any sequence of
	 * symbols that is accepted by either self or other. Note that the set
	 * of strings recognised by the two Fsms undergoes a set union.
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
		return crawlParallel(
			prependFsm(this, fsms), 
			accepts => accepts.every(val => val));
	}
	
	/**
	 * Treat the Fsms as sets of strings and return the
	 * intersection of those sets in the form of a new Fsm.
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
		return crawlParallel(
			prependFsm(this, fsms), 
			accepts => accepts.filter(val => val).length % 2 === 1);
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
		const initial = new X.Guide([[0, this.initial]]);
		
		/** */
		const followFn = (guide: X.Guide, symbol: string) =>
		{
			const next = new X.Guide();
			const first = guide.first();
			
			if (first !== undefined)
				if (this.transitions.has(first, symbol))
					next.add(0, this.transitions.get(first, symbol));
			
			return next;
		};
		
		/** */
		const finalFn = (guide: X.Guide) =>
		{
			const first = guide.first();
			return !(first !== undefined && this.finals.has(first));
		};
		
		return crawl(this.alphabet, initial, finalFn, followFn);
	}
	
	/**
	 * @returns A new Fsm such that for every input that the supplied
	 * Fsm accepts, the new Fsm accepts the same input, but reversed.
	 */
	reverse()
	{
		// Start from a composite "state-set" consisting of all final states.
		// If there are no final states, this set is empty and we'll find that
		// no other states get generated.
		const initial = new X.Guide();
		
		for (const stateId of this.finals)
			initial.add(stateId);
		
		// Find every possible way to reach the current state-set
		// using this symbol.
		const followFn = (guide: X.Guide, symbol: string) =>
		{
			const next = new X.Guide();
			
			for (const prevStateId of this.transitions.eachStateId())
				for (const stateId of guide.keys())
					if (this.transitions.has(prevStateId, symbol))
						if (this.transitions.get(prevStateId, symbol) === stateId)
							next.add(prevStateId);
			
			return next.size === 0 ?
				Oblivion :
				next;
		};
		
		/** */
		const finalFn = (guide: X.Guide) => guide.has(this.initial);
		
		return crawl(this.alphabet, initial, finalFn, followFn);
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
		return !this.xor(other).isEmpty();
	}
	
	/**
	 * @returns An Fsm instance which recognises only the inputs
	 * recognised by the first Fsm instance in the list, but none of 
	 * the others.
	 */
	difference(...fsms: Fsm[])
	{
		return crawlParallel(
			prependFsm(this, fsms), 
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
	 * An Fsm is empty if it recognises no strings. An Fsm may be arbitrarily
	 * complicated and have arbitrarily many final states while still recognising
	 * no strings because those final states may all be inaccessible from the
	 * initial state. Equally, an Fsm may be non-empty despite having an empty
	 * alphabet if the initial state is final.
	 */
	isEmpty()
	{
		return !this.isStateLive(this.initial);
	}
	
	/**
	 * Generate strings (lists of symbols) that this Fsm accepts. Since there may
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
	 * Compute the Brzozowski derivative of this Fsm with respect to the input
	 * string of symbols. <https://en.wikipedia.org/wiki/Brzozowski_derivative>
	 * If any of the symbols are not members of the alphabet, that's a KeyError.
	 * If you fall into oblivion, then the derivative is an Fsm accepting no
	 * strings.
	 * 
	 * @returns A new Fsm instance with the computed characteristics.
	 */
	derive(input: string)
	{
		let stateId: number = this.initial;
		
		for (const char of input)
		{
			const symbol = (() =>
			{
				if (this.alphabet.has(char))
				{
					if (!this.alphabet.hasWildcard)
						throw new Error(char);
					
					return X.Alphabet.wildcard;
				}
				
				return char;
			})();
			
			if (!this.transitions.has(stateId, symbol))
				return Oblivion;
			
			stateId = this.transitions.acquire(stateId, symbol);
		}
		
		return new Fsm(
			this.alphabet,
			this.states,
			stateId,
			this.finals,
			this.transitions.clone());
	}
	
	/**
	 * @returns A string representation of this object, 
	 * for testing and debugging purposes.
	 */
	toString()
	{
		return [
			"alphabet = " + this.alphabet.toString(),
			"states = " + Array.from(this.states).join(),
			"inital = " + this.initial,
			"finals = " + Array.from(this.finals).join(),
			"transitions = " + this.transitions.toString()
		].join("\n");
	}
}


/**
 * Utility function to prepend an Fsm instance to an Fsm array.
 */
function prependFsm(fsm: Fsm, fsms: Fsm[])
{
	return [fsm].concat(...fsms);
}


/**
 * Crawl several Fsms in parallel, mapping the states of a larger meta-Fsm.
 * To determine whether a state in the larger Fsm is final, pass all of the
 * finality statuses (e.g. [true, false, false] to testFn.
 */
function crawlParallel(fsms: Fsm[], testFn: (accepts: boolean[]) => boolean)
{
	const initial = new X.Guide();
	
	for (const [index, fsm] of fsms.entries())
		initial.add(index, fsm.initial);
	
	/**
	 * Dedicated function accepts a "superset" and returns the next "superset"
	 * obtained by following this transition in the new Fsm.
	 */
	const followFn = (guide: X.Guide, symbol: string) =>
	{
		const next = new X.Guide();
		
		for (const [index, fsm] of fsms.entries())
		{
			const stateId = guide.get(index);
			if (stateId === null || stateId === undefined)
				continue;
			
			const substateId = fsm.transitions.get(stateId);
			if (substateId === undefined)
				continue;
			
			const alpha = fsm.alphabet;
			const actualSymbol = alpha.has(symbol) && alpha.hasWildcard() ?
				X.Alphabet.wildcard :
				symbol;
			
			if (substateId.has(actualSymbol))
				next.add(index, fsm.transitions.get(stateId, actualSymbol));
		}
		
		if (next.size === 0)
			return Oblivion;
		
		return next;
	};
	
	/**
	 * Determine the "is final?" condition of each substateId, then pass it to the
	 * test to determine finality of the overall Fsm.
	 */
	const finalFn = (guide: X.Guide) =>
	{
		const accepts: boolean[] = [];
		
		for (const [idx, fsm] of fsms.entries())
		{
			const substateId = guide.get(idx);
			if (substateId !== null && substateId !== undefined)
				accepts.push(guide.has(idx) && fsm.finals.has(substateId));
		}
		
		return testFn(accepts);
	};
	
	const alphabets = fsms.map(fsm => fsm.alphabet);
	const alphabet = new X.AlphabetBuilder(...alphabets).toAlphabet();
	return crawl(alphabet, initial, finalFn, followFn).reduce();
}


/**
 * Given the above conditions and instructions, crawl a new unknown Fsm,
 * mapping its states, final states and transitions. Return the new Fsm.
 */
function crawl(
	alphabet: X.Alphabet,
	initial: X.Guide,
	finalFn: (guide: X.Guide) => boolean,
	followFn: (guide: X.Guide, symbol: string) => X.Guide | typeof Oblivion)
{
	const debugLines: string[] = [];
	const guides = [initial];
	const finals = new Set<number>();
	const transitions = new X.MutableTransitionMap();
	
	// Iterate over a growing list
	for (const [i, guide] of guides.entries())
	{
		// Add to finals
		if (finalFn(guide))
			finals.add(i);
		
		// Compute transitions for this state
		transitions.initialize(i);
		
		for (const symbol of alphabet)
		{
			const next = followFn(guide, symbol);
			if (next !== Oblivion)
			{
				let nextIdx = guides.findIndex(guide => guide.equals(next));
				if (nextIdx < 0)
				{
					nextIdx = guides.length;
					guides.push(next);
				}
				
				transitions.set(i, symbol, nextIdx);
				debugLines.push(next.toString());
			}
		}
	}
	
	return new Fsm(
		alphabet,
		new Set(Array(guides.length).keys()),
		0,
		finals,
		transitions);
}
