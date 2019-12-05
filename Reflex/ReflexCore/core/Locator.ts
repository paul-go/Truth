
namespace Reflex.Core
{
	let nextVal = 0;
	let nextTimestamp = 0;
	
	/** */
	export const enum LocatorType
	{
		branch = 0,
		leaf = 1,
		stream = 2
	}
	
	/**
	 * A multi-level indexing data type, used to control where new sibling branches
	 * should be inserted in a given sibling list.
	 * 
	 * Locators are used to solve the problem of determining where to position the
	 * leaves and branches returned by recurrent functions within some other branch.
	 * 
	 * Each Meta object has a corresponding Locator.
	 */
	export class Locator
	{
		/**
		 * Returns a fully formed Locator object from it's serialized representation.
		 */
		static parse(serializedLocator: string)
		{
			const parts = serializedLocator.split(/[|>]/g);
			const type = <LocatorType>parseInt(parts.shift() || "0", 10) || LocatorType.branch;
			const locator = new Locator(type);
			locator.homeTimestamp = parseInt(parts.shift() || "0", 10) || 0;
			locator.values.push(...parts.map(p => parseInt(p, 10) || 0));
			return locator;
		}
		
		constructor(readonly type: LocatorType) { }
		
		/** */
		toString()
		{
			return (
				this.type + "|" +
				this.homeTimestamp + "|" +
				this.values.join(">")
			);
		}
		
		/**
		 * The below array is initialized to empty when the Locator instance
 		 * is instantiated. This is because when locators are first instantiated,
 		 * they refer to metas that are floating in limbo -- they're not attached
 		 * to anything. Locator values only become relevant at the point when
 		 * they are attached to some containing meta, because otherwise, it's
 		 * not possible for the locator to refer to a meta that has "siblings", 
 		 * which is the entire point of the Locator concept.
		 */
		private values: number[] = [];
		
		/**
		 * 
		 */
		setLastLocatorValue(value: number)
		{
			this.values[this.values.length - 1] = value;
		}
		
		/**
		 * 
		 */
		getLastLocatorValue()
		{
			return this.values[this.values.length - 1];
		}
		
		/**
		 * Timestamps are attached to each meta. They are only used to determine
		 * whether two metas originated in the same container. When iterating
		 * through a meta's children, its possible that some of the metas were moved
		 * in as siblings at runtime. Timestamps are used to make sure these foreign
		 * metas are omitted when doing these iterations.
		 */
		private readonly timestamp = ++nextTimestamp;
		
		/**
		 * Stores the timestamp of the branch that was the original "home" of
		 * the branch that this locator refers to. "Home" in this case means the
		 * branch where it was originally appended. In the case when the locator
		 * hasn't been appended anywhere, the value is 0.
		 */
		private homeTimestamp = 0;
		
		/** */
		setContainer(containerLoc: Locator)
		{
			if (this.homeTimestamp !== 0)
				return;
			
			if (Const.debug && this.values.length > 0)
				throw new Error("?");
			
			const val = ++nextVal;
			
			if (containerLoc.type === LocatorType.stream)
			{
				this.homeTimestamp = containerLoc.homeTimestamp;
				this.values.push(...containerLoc.values, val);
			}
			else if (containerLoc.type === LocatorType.branch)
			{
				this.homeTimestamp = containerLoc.timestamp;
				this.values.push(val);
			}
			else if (Const.debug && containerLoc.type === LocatorType.leaf)
				throw new Error("?");
		}
		
		/** */
		compare(other: Locator): CompareResult
		{
			// Detect a potential comparison with a floating meta
			if (this.homeTimestamp === 0 || other.homeTimestamp === 0)
				return CompareResult.incomparable;
			
			// Detect differing originating containers
			if (this.homeTimestamp !== other.homeTimestamp)
				return CompareResult.incomparable;
			
			const thisLast = this.values[this.values.length - 1];
			const otherLast = other.values[other.values.length - 1];
			
			// Detect simple equality
			if (thisLast === otherLast)
				return CompareResult.equal;
			
			// We're running a comparison on the common portion of the
			// two number sequences. If the one is longer than the other,
			// it's not considered here.
			const minLen = Math.min(this.values.length, other.values.length);
			
			for (let i = -1; ++i < minLen;)
			{
				const thisVal = this.values[i];
				const otherVal = other.values[i];
				
				if (thisVal < otherVal)
					return CompareResult.higher;
				
				if (thisVal > otherVal)
					return CompareResult.lower;
			}
			
			// The code below handles the case when we have two sequences
			// of values, where the one sequences is basically an extension of the
			// other, ultimately looking something like this:
			// 
			// 1>2
			// 1>2>3>4
			// 
			// In this case, the shorter sequence is considered "lower" than the
			// longer one, because in this case, the consumers of this method are
			// basically trying to "get to the end of all the 1>2's", and using 1>2
			// as the input to communicate that.
			
			if (this.values.length > other.values.length)
				return CompareResult.higher;
			
			if (this.values.length < other.values.length)
				return CompareResult.lower;
			
			throw new Error("?");
		}
	}
	
	/** */
	export const enum CompareResult
	{
		equal,
		incomparable,
		higher,
		lower
	}	
}
