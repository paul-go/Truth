import * as X from "../X";


/**
 * @internal
 */
export class TransitionMap
{
	/** */
	constructor(transitionLiteral?: ITransitionLiteral)
	{
		const transitions = new Map<number, X.TransitionState>();
		
		if (transitionLiteral)
		{
			for (const [stateIdText, tslObject] of Object.entries(transitionLiteral))
			{
				const stateId = parseInt(stateIdText, 10);
				
				if (stateId !== stateId)
					throw new TypeError();
				
				if (!tslObject || typeof tslObject !== "object")
					throw new TypeError();
				
				const tsl: X.ITransitionStateLiteral = tslObject;
				transitions.set(stateId, new X.TransitionState(tsl));
			}
		}
		
		this.transitions = transitions;
	}
	
	/** */
	*[Symbol.iterator]()
	{
		for (const [stateId, transitionState] of this.transitions.entries())
			yield <[number, X.TransitionState]>[stateId, transitionState];
	}
	
	/** */
	clone()
	{
		const out = new TransitionMap({});
		
		for (const [key, value] of this.transitions)
			out.transitions.set(key, value.clone());
		
		return out;
	}
	
	/** */
	has(stateId: number, symbol?: string)
	{
		const transitionState = this.transitions.get(stateId);
		
		if (!transitionState)
			return false;
		
		if (symbol === undefined)
			return !!transitionState;
		
		return transitionState.has(symbol);
	}
	
	/** */
	get(stateId: number): X.TransitionState | undefined;
	get(stateId: number, symbol: string): number | undefined;
	get(stateId: number, symbol?: string)
	{
		const transitionState = this.transitions.get(stateId);
		
		if (!transitionState)
			return undefined;
		
		if (symbol === undefined)
			return transitionState;
		
		return transitionState.get(symbol);
	}
	
	/** */
	acquire(stateId: number): X.TransitionState;
	acquire(stateId: number, symbol: string): number;
	acquire(stateId: number, symbol?: string)
	{
		const transitionState = this.transitions.get(stateId);
		
		if (!transitionState)
			throw new Error();
		
		if (symbol === undefined)
			return transitionState;
		
		const subStateId = transitionState.get(symbol);
		if (subStateId === undefined)
			throw new Error();
		
		return subStateId;
	}
	
	/** */
	*eachStateId()
	{
		for (const stateId of this.transitions.keys())
			yield stateId;
	}
	
	/**
	 * @returns A string representation of this object, 
	 * for testing and debugging purposes.
	 */
	toString()
	{
		const out = ["{"];
		
		for (const [stateId, tState] of this.transitions)
			out.push("\t" + stateId + ": " + tState.toString());
		
		out.push("}");
		return out.join("\n");
	}
	
	/** */
	protected readonly transitions: Map<number, X.TransitionState>;
}


/**
 * @internal
 */
export class MutableTransitionMap extends TransitionMap
{
	/** */
	initialize(srcStateId: number)
	{
		this.transitions.set(srcStateId, new X.TransitionState());
	}
	
	/** */
	set(srcStateId: number, symbol: string, dstStateId: number)
	{
		const tState = this.transitions.get(srcStateId);
		
		if (!tState)
		{
			const tState = new X.TransitionState();
			tState.set(symbol, dstStateId);
			this.transitions.set(srcStateId, tState);
		}
		else
		{
			tState.set(symbol, dstStateId);
		}
	}
}


/**
 * 
 */
export interface ITransitionLiteral
{
	[stateId: number]: X.ITransitionStateLiteral;
}
