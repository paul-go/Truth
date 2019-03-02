import * as X from "../X";


/**
 * Infinite incremental counter.
 */
export class VersionStamp
{
	/** */
	static next()
	{
		const createStamp = (stamp: number | number[]) =>
			new VersionStamp(Object.freeze(stamp));
		
		if (typeof BigInt !== "undefined")
		{
			if (this.nextStamp === undefined)
				return createStamp(this.nextStamp = BigInt(1));
			
			// See: https://github.com/eslint/eslint/issues/10574
			// eslint-disable-next-line valid-typeof
			if (typeof this.nextStamp === "bigint")
				return createStamp(++this.nextStamp);
		}
		else
		{
			if (this.nextStamp === undefined)
			{
				this.nextStamp = [1];
				return createStamp(this.nextStamp.slice());
			}
			
			const ns = this.nextStamp;
			
			if (Array.isArray(ns))
			{
				// Polyfill infinite number counter for use in the 
				// absence of a native BigInt implementation.
				for (let i = ns.length; i-- > 0;)
				{
					if (ns[i] === 999_999_999_999)
					{
						ns[i] = 0;
						
						if (i === 0)
							ns.unshift(1);
					}
					else
					{
						ns[i]++;
						break;
					}
				}
				
				return createStamp(ns.slice());
			}
		}
		
		throw X.Exception.unknownState();
	}
	
	/** */
	private static nextStamp: number | number[];
	
	/** */
	protected constructor(private readonly stamp: number | number[]) { }
	
	/** */
	newerThan(otherStamp: VersionStamp)
	{
		return this.stamp > otherStamp.stamp;
	}
	
	/** */
	toString()
	{
		return Array.isArray(this.stamp) ?
			this.stamp.join("") :
			this.stamp.toString();
	}
}

declare const BigInt: Function;
