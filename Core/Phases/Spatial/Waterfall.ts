import * as X from "../../X";


/**
 * 
 */
export class Waterfall
{
	/**  */
	static create(directive: X.Uri, program: X.Program)
	{
		if (directive.typePath.length === 0)
			return null;
		
		const sourceDoc = program.documents.get(directive);
		if (sourceDoc === null)
			throw X.Exception.invalidArgument();
		
		/**
		 * Stores a cursor used to identify the index of the
		 * type name being processed in the directive.
		 * 
		 * As the waterfall is constructed, the directive cursor is
		 * scaled up and down.
		 */
		const pathCursor = new PathCursor(directive);
		
		const originNode = X.Guard.null(program.graph.read(
			sourceDoc,
			pathCursor.originName));
		
		const matrix: (IMutableTurn | undefined)[][] = [[{
			terminal: false,
			nodes: [originNode]
		}]];
		
		const getTotalWidth = () => matrix[0].length;
		
		/**
		 * Stores a stack of turns on which the "flow" direction has not yet
		 * been handled. These are gradually pushed onto the stack and
		 * popped off when the algorithm runs out of plunges to handle.
		 */
		const unflownTurnStack: [number, number][] = [[0, 0]];
		
		let x = 0;
		let y = 0;
		
		/** */
		function tryPlunge()
		{
			if (pathCursor.atEnd)
				return false;
			
			const plungeToName = X.Guard.null(pathCursor.nextName);
			const nodesAtPlunge = <X.Node[]>getCursor().nodes
				.map(node => node.contents.get(plungeToName))
				.filter(node => node !== undefined);
			
			// If there's nowhere to plunge.
			if (nodesAtPlunge.length === 0)
				return false;
			
			unflownTurnStack.push([x, ++y]);
			plot(nodesAtPlunge);
			pathCursor.advance();
			return true;
		}
		
		/** */
		function tryFlow()
		{
			if (unflownTurnStack.length === 0)
				return false;
			
			const [turnX, turnY] = X.Guard.undefined(unflownTurnStack.pop());
			
			if (turnY !== y)
				pathCursor.backtrack(turnY);
			
			x = turnX;
			y = turnY;
			
			const cursorNodes = getCursor().nodes;
			const cursorNodesFiltered = cursorNodes.filter(node => node.outbounds.length > 0);
			
			const rightFansUnflattened = getCursor().nodes
				.filter(node => node.outbounds.length > 0)
				.map(node => node.outbounds
					.filter(fan => fan.targets.length > 0));
			
			// If there's nowhere to flow
			if (rightFansUnflattened.length === 0)
				return false;
			
			const rightFans = rightFansUnflattened.length === 1 ?
				rightFansUnflattened[0] :
				rightFansUnflattened.reduce((a, b) => a.concat(b));
			
			const rightNodesUnflattened = rightFans.map(node => node.targets);
			
			if (rightNodesUnflattened.length === 0)
				return false;
			
			const rightNodes = new Set(rightNodesUnflattened.length === 1 ?
				rightNodesUnflattened[0] : 
				rightNodesUnflattened.reduce((a, b) => a.concat(b)));
			
			if (rightNodes.size === 0)
				return false;
			
			// Move the cursor far enough to the right so that
			// it clears other turns to the left of it.
			x = getTotalWidth();
			
			// We can easily check for circular references by determining
			// if any of the nodes about to be plotted already exist in the
			// terrace, to the right of the current cursor position. We only
			// need to do this when we're 1 level past the directive.
			if (x > 0)
			{
				const preceedingTurns = <IMutableTurn[]>matrix[y]
					.slice(0, x - 1)
					.filter(t => t !== undefined);
				
				// Stores the set of nodes that were found to have already
				// been plotted to the left of the cursor. In an fault-free
				// document, this array is always empty.
				const preExistingNodes = new Set<X.Node>();
				
				for (const preceedingTurn of preceedingTurns)
					for (const preceedingNode of preceedingTurn.nodes)
						if (rightNodes.has(preceedingNode))
							preExistingNodes.add(preceedingNode);
				
				// Any node that was found to be pre-existing can't be
				// plotted on the waterfall, because doing so would
				// cause an infinite loop of flowing. Instead, these need
				// to be reported as faults.
				for (const preExistingNode of preExistingNodes)
				{
					if (rightNodes.has(preExistingNode))
					{
						for (const span of preExistingNode.spans)
							program.faults.report(X.Faults.CircularTypeReference.create(span));
						
						rightNodes.delete(preExistingNode);
					}
				}
			}
			
			plot(Array.from(rightNodes));
			return true;
		}
		
		/**
		 * Positions a Node in the matrix at the location of the cursor.
		 */
		function plot(param: X.Node | ReadonlyArray<X.Node>)
		{
			// Make sure there is a slot in the matrix
			// before the node is plotted.
			if (y >= matrix.length)
				matrix.push(new Array(getTotalWidth()));
			
			if (x >= getTotalWidth())
				for (const terrace of matrix)
					terrace.push(undefined);
			
			const nodes = param instanceof X.Node ? [param] : param.slice();
			const existingTurn = matrix[y][x];
			
			if (existingTurn)
				existingTurn.nodes.push(...nodes);
			else
				matrix[y][x] = { terminal: false, nodes: nodes };
		}
		
		/** */
		function getCursor()
		{
			const terrace = matrix[y];
			if (x >= terrace.length)
				throw X.Exception.unknownState();
			
			const turn = terrace[x];
			if (turn === undefined)
				throw X.Exception.unknownState();
			
			return turn;
		}
		
		//
		// Waterfall algorithm descriptive poem:
		// 
		// Plunge until you can't. 
		// Then try to flow...
		// But quit if you can't,
		// Or repeat if there's more to go.
		//
		plungeLoop: for (;;)
		{
			while (tryPlunge());
			
			while (unflownTurnStack.length > 0)
				if (tryFlow())
					continue plungeLoop;
			
			break;
		}
		
		return new Waterfall(directive, matrix, program);
	}
	
	/** @internal */
	private constructor(directive: X.Uri, terraces: (Turn | undefined)[][], program: X.Program)
	{
		this.directive = directive;
		this.origin = null!;
		this.terraces = terraces;
	}
	
	/** */
	readonly directive: X.Uri;
	
	/** */
	readonly origin: X.Turn;
	
	/**
	 * @returns The number of terraces in the underlying
	 * waterfall. Used to quickly determine if a URI was directed
	 * at an unpopulated location in a document.
	 */
	readonly totalHeight: number = 0;
	
	/**
	 * Stores an array of faults that were generated before
	 * the Waterfall was constructed.
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
		if (uri.typePath.length > this.directive.typePath.length)
			throw X.Exception.invalidArgument();
		
		for (let i = -1; ++i < uri.typePath.length;)
			if (uri.typePath[i] !== this.directive.typePath[i])
				throw X.Exception.invalidArgument();
		
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
		const waterfall = this;
		
		/**
		 * A class that acts as a cursor for walking around a Waterfall
		 * instance. Note that the WaterfallWalker does, in fact, walk
		 * on water.
		 */
		return new class WaterfallWalker
		{
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
	}
	
	/** */
	private readonly terraces: ReadonlyArray<(Turn | undefined)[]>;
}


/**
 * A class for scaling up and down a type path.
 */
class PathCursor
{
	constructor(uri: X.Uri)
	{
		this.typePath = uri.typePath;
	}
	
	/** */
	advance()
	{
		if (!this.atEnd)
			this.cursor++;
	}
	
	/** */
	backtrack(to: number)
	{
		if (to < 0 || to >= this.cursor)
			throw X.Exception.invalidArgument();
		
		this.cursor = to;
	}
	
	/** */
	get originName() { return this.typePath[0]; }
	
	/** */
	get finalName() { return this.typePath[this.typePath.length - 1]; }
	
	/** */
	get currentName() { return this.typePath[this.cursor]; }
	
	/** */
	get nextName() { return this.atEnd ? null : this.typePath[this.cursor + 1]; }
	
	/** */
	get previousName() { return this.atStart ? null : this.typePath[this.cursor - 1]; }
	
	/** */
	get atStart() { return this.cursor === 0; }
	
	/** */
	get atEnd() { return this.cursor >= this.typePath.length - 1; }
	
	/** */
	private readonly typePath: ReadonlyArray<string>;
	
	/** */
	private cursor = 0;
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
