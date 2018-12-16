import * as X from "../X";


/**
 * @internal
 */
export class TransitionState
{
	/** */
	constructor(source?: ITransitionStateLiteral)
	{
		this.stateMap = new Map();
		
		if (source)
			for (const [symbol, stateId] of Object.entries(source))
				this.stateMap.set(symbol, stateId);
	}
	
	/** */
	clone()
	{
		const cloned = new TransitionState();
		
		for (const [symbol, stateId] of this.stateMap)
			cloned.stateMap.set(symbol, stateId);
		
		return cloned;
	}
	
	/** */
	has(symbol: string)
	{
		return this.stateMap.has(symbol);
	}
	
	/** */
	get(symbol: string)
	{
		return this.stateMap.get(symbol);
	}
	
	/** */
	set(symbol: string, stateId: number)
	{
		this.stateMap.set(symbol, stateId);
	}
	
	/** */
	*eachSymbol()
	{
		for (const symbol of this.stateMap.keys())
			yield symbol;
	}
	
	/** */
	protected readonly stateMap: Map<string, number>;
}


/**
 * 
 */
export interface ITransitionStateLiteral
{
	[symbol: string]: number;
}
