import * as X from "../X";


/**
 * @internal
 */
export class Guide
{
	/** */
	constructor(from?: number | [number, number][] | Guide)
	{
		if (from instanceof Guide)
		{
			this.hasDst = from.hasDst;
			for (const [stateIdSrc, stateIdDst] of from.arrows)
				this.arrows.set(stateIdSrc, stateIdDst);
		}
		else if (typeof from === "number")
		{
			this.add(from);
		}
		else if (from)
		{
			for (const [stateIdSrc, stateIdDst] of from)
				this.arrows.set(stateIdSrc, stateIdDst);
		}
	}
	
	/** */
	clone()
	{
		const cloned = new Guide();
		
		for (const [stateIdSrc, stateIdDst] of this.arrows)
			cloned.arrows.set(stateIdSrc, stateIdDst);
		
		return cloned;
	}
	
	/** */
	has(stateIdSrc: number)
	{
		return this.arrows.has(stateIdSrc);
	}
	
	/** */
	get(stateIdSrc: number)
	{
		return this.arrows.get(stateIdSrc);
	}
	
	/** */
	add(stateIdSrc: number, stateIdDst: number | null = null)
	{
		if (this.isFrozen)
			throw new TypeError();
		
		if (this.hasDst === null)
		{
			this.arrows.set(stateIdSrc, stateIdDst);
		}
		else
		{
			if (stateIdDst !== stateIdDst)
				throw new TypeError();
			
			if ((this.hasDst === true && typeof stateIdDst !== "number") ||
				(this.hasDst === false && typeof stateIdDst === "number"))
				throw new Error("Parameters need to be kept consistent across the instance.");
			
			this.arrows.set(stateIdSrc, stateIdDst);
		}
		
		this.hasDst = stateIdDst !== null;
	}
	
	/** */
	append(other: Guide)
	{
		if (this.isFrozen)
			throw new TypeError();
		
		if (this.hasDst === null)
		{
			for (const [src, dst] of other.arrows)
			{
				this.hasDst = typeof dst === "number";
				this.arrows.set(src, dst);
			}
		}
		else
		{
			if (other.hasDst === null)
			{
				if (other.size !== 0)
					throw X.Exception.unknownState();
			}
			else
			{
				for (const [src, dst] of other.arrows)
					this.arrows.set(src, dst);
			}
		}
	}
	
	/** */
	first()
	{
		const out = this.arrows.get(0);
		if (out === null || out === undefined)
			throw new Error();
		
		return out;
	}
	
	/** */
	*keys()
	{
		for (const src of this.arrows.keys())
			yield src;
	}
	
	/** */
	*values()
	{
		if (this.hasDst === true)
			for (const dst of this.arrows.values())
				yield dst!;
	}
	
	/** */
	*entries()
	{
		if (this.hasDst === false)
			throw new Error("Cannot enumerate the full entries of this instance.");
		
		for (const [stateIdSrc, stateIdDst] of this.arrows)
			yield <[number, number]>[stateIdSrc, stateIdDst!];
	}
	
	/** */
	get size() { return this.arrows.size; }
	
	/**
	 * @returns A boolean value that indicates whether the contents
	 * of this guide match the contents of the guide specified in the
	 * parameter.
	 */
	equals(other: Guide)
	{
		if (this.size !== other.size)
			return false;
		
		for (const [src, dst] of this.arrows)
			if (other.arrows.get(src) !== dst)
				return false;
		
		return true;
	}
	
	/** */
	freeze()
	{
		this.isFrozen = true;
		return this;
	}
	
	/**
	 * @returns A string representation of this object, 
	 * for testing and debugging purposes.
	 */
	toString()
	{
		if (this.hasDst)
		{
			const literal: string[] = [];
			
			for (const [stateIdSrc, stateIdDst] of this.arrows)
				literal.push(stateIdSrc + ": " + stateIdDst);
			
			return "{ " + literal.join(", ") + " }";
		}
		
		return "[" + Array.from(this.arrows.keys()).join(", ") + "]";
	}
	
	/** */
	private hasDst: boolean | null = null;
	
	/** */
	private isFrozen = false;
	
	/** */
	private readonly arrows = new Map<number, number | null>();
}
