import * as X from "../../X";


/**
 * 
 */
export class Waterfall
{
	/** */
	static create(directiveUri: X.Uri, program: X.Program)
	{
		if (directiveUri.typePath.length === 0)
			return null;
		
		// Return null if a waterfall couldn't be created here.
		
		return new Waterfall(directiveUri, program);
	}
	
	/** @internal */
	private constructor(directive: X.Uri, program: X.Program)
	{
		this.origin = null!;
		
		/*
		Run the waterfall construction algorithm here.
		
		- The algorithm always plunges before it flows
		
		- It stops plunging once it either hits the floor, 
		or it can't plunge any further
		
		- When it can't plunge anymore, it flows.
		
		- When it can't plunge or flow, it moves back to 
		the last un-flown turn, flows it, and the process repeats.
		
		- The actual grid is stored away somewhere, so 
		the algorithm doesn't need to keep track of where
		it's plunging and flowing.
		.*/
	}
	
	/** */
	readonly origin: X.Turn;
	
	/** */
	readonly directive: ReadonlyArray<X.Turn> = [];
	
	/**
	 * @returns The number of terraces in the underlying
	 * waterfall. Used to quickly determine if a URI was directed
	 * at an unpopulated location in a document.
	 */
	readonly totalHeight: number = 0;
	
	/**
	 * Stores an array of faults that were generated before the
	 * Waterfall was constructed.
	 */
	readonly constructionFaults: ReadonlyArray<X.Fault> = [];
	
	/**
	 * Reads a full terrace from the waterfall, from the specified
	 * URI.
	 * 
	 * @throws If the URI has typePath that is not a strict subset
	 * of this Waterfall's directive.
	 */
	readTerrace(uri: X.Uri): ReadonlyArray<X.Turn | undefined>
	{
		return [];
	}
	
	/** */
	readFloorTerrace()
	{
		// Does this method just throw the Turns back at the 
		// call site? Or should it backing this stuff into something
		// that's easier to use?
		return [];
	}
	
	/** */
	walk()
	{
		return new WaterfallWalker(this);
	}
}


/**
 * A class that acts as a cursor for walking around a Waterfall
 * instance. Note that the WaterfallWalker does, in fact, walk
 * on water.
 */
export class WaterfallWalker
{
	constructor(private readonly waterfall: Waterfall) { }
	
	/** */
	plunge(): Turn | null
	{
		return null;
	}
	
	/** */
	canPlunge(): boolean
	{
		return false;
	}
	
	/** */
	flow(): Turn | null
	{
		return null;
	}
	
	/** */
	canFlow(): boolean
	{
		return false;
	}
}


/**
 * 
 */
class Grid
{
	/** */
	constructor(origin: X.Node)
	{
		this.unflownTurnStack.push([0, 0]);
		this.terraces = [[{
			terminal: false,
			nodes: [origin]
		}]];
	}
	
	/** */
	plungeTo(nodes: X.Node[])
	{
		const storedCursor: [number, number] = [this.x, this.y];
		this.y++;
		
		if (this.terraces.length < this.y)
			this.terraces.push(new Array(this.totalWidth));
		
		this.terraces[this.y][this.x] = {
			terminal: false,
			nodes: nodes.slice()
		};
		
		this.unflownTurnStack.push(storedCursor);
	}
	
	/** */
	flowTo(nodes: X.Node[])
	{
		// TODO: Make sure the flow is being written past the
		// end of the last Turn.
	}
	
	/** */
	moveToLastUnflown()
	{
		const lastUnflown = this.unflownTurnStack.pop();
		if (lastUnflown === undefined)
			throw X.ExceptionMessage.unknownState();
		
		this.x = lastUnflown[0];
		this.y = lastUnflown[1];
	}
	
	/** */
	get totalWidth()
	{
		return this.terraces[0].length;
	}
	
	/** */
	get totalHeight()
	{
		return this.terraces.length;
	}
	
	/** */
	private getCursor()
	{
		const terrace = this.terraces[this.y];
		if (this.x >= terrace.length)
			throw X.ExceptionMessage.unknownState();
		
		const turn = terrace[this.x];
		if (turn === undefined)
			throw X.ExceptionMessage.unknownState();
		
		return turn;
	}
	
	/**
	 * Stores a stack of turns on which the "flow" direction has not yet
	 * been handled. These are gradually pushed onto the stack and
	 * popped off when the algorithm runs out of plunges to handle.
	 */
	private unflownTurnStack: [number, number][] = [];
	
	private x = 0;
	private y = 0;
	
	/** */
	private readonly terraces: (IMutableTurn | undefined)[][];
}


/**
 * 
 */
interface IMutableTurn
{
	/**
	 * Indicates whether this Turn terminates the flow of it's ledge.
	 */
	terminal: boolean;
	
	/** 
	 * Stores the array of Node objects that correspond to this turn.
	 */
	nodes: X.Node[];
}

export type Turn = Freeze<IMutableTurn>;
