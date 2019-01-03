import * as X from "../../X";


/**
 * @internal
 * Renders a URI onto a *Waterfall*, which is a 2-dimensional
 * matrix of Nodes and Fans.
 * 
 * Nodes and Fans are plotted on the waterfall in the form of
 * "Turns". Nodes are plotted by "plunging" (going downward)
 * and it's associated fans are plotted by "flowing" (going right-
 * ward). The oscilation between plunging and flowing follows
 * a circular / stack based process that is best described in this
 * poem:
 * 
 *	Plunge until you can't. 
 *	Then try to flow...
 *	But quit if you can't,
 *	Or repeat if there's more to go.
 * 
 * This technique allows Truth structures to be analyzed
 * entirely, simply by scanning one "Terrace" of the waterfall,
 * which is a horizontal scan line of the matrix.
 * 
 * This technique seems as though it's probably drawing on
 * some known or unknown graph-theoretical axiom, because
 * it makes it so that everything that could possibly be verified
 * in a truth document (from a type-structural point of view) is
 * not only possible, but simplified to a *shocking* degree.
 */
export class WaterfallRenderer
{
	/**  */
	static invoke(directive: X.Uri, program: X.Program)
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
		const pathCursor = new X.PathCursor(directive);
		
		const originNode = program.graph.read(
			sourceDoc,
			pathCursor.originName);
		
		if (originNode === null)
			return null;
		
		const matrix: Terrace[] = [[new X.NodesTurn([originNode])]];
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
			logMatrix(matrix);
			
			if (pathCursor.atEnd)
				return false;
			
			const plungeToName = X.Guard.null(pathCursor.nextName);
			const cursorTurn = getCursorTurn();
			
			console.log(`Somehow we need to end up with the captures
				placed in the plunge array`);
			
			const cursorNodes = getCursorNodes();
			const plungeNodes = cursorNodes
				.map(node => node instanceof X.Node ? 
					node.contents.get(plungeToName) :
					undefined);
			
			// If there's nowhere to plunge.
			if (plungeNodes.filter(n => n !== undefined).length === 0)
				return false;
			
			y++;
			pathCursor.advance();
			plot(new X.NodesTurn(plungeNodes));
			unflownTurnStack.push([x, y]);
			logMatrix(matrix);
			return true;
		}
		
		/** */
		function tryFlow()
		{
			logMatrix(matrix);
			if (unflownTurnStack.length === 0)
				return false;
			
			const [turnX, turnY] = X.Guard.undefined(unflownTurnStack.pop());
			
			if (turnY !== y)
				pathCursor.backtrack(turnY);
			
			x = turnX;
			y = turnY;
			
			const flowFans = getCursorNodes()
				.filter((node): node is X.Node => node instanceof X.Node)
				.filter(node => node.outbounds.length > 0)
				.map(node => node.outbounds.filter(fan => fan.targets.length > 0))
				.reduce((a, b) => (a || []).concat(b), []);
			
			// If there's nowhere to flow
			if (flowFans.length === 0)
				return false;
			
			/*
			const flowFansFromTypes = flowFans
				.filter(fan => fan.rationale === X.FanRationale.type);
			
			const flowFansFromAliases = flowFans
				.filter(fan => fan.rationale === X.FanRationale.pattern);
			
			if (flowFansFromAliases.length)
			{
				const flowAliases = flowFansFromAliases.map(fan => fan.name);
				const flowPatterns = flowFansFromAliases
					.map(fan => fan.targets
						.map(node => node.subject)
						.filter((sub): sub is X.Pattern => sub instanceof X.Pattern))
					.reduce((a, b) => a.concat(b), [])
					.filter((v, i, a) => a.indexOf(v) === i);
				
				flowPatterns.map(pat => pat.exec());
			}
			
			const flowFansFromSums = flowFans
				.filter(fan => fan.rationale === X.FanRationale.sum);
			
			if (flowFansFromSums.length)
			{
				const flowSums = flowFansFromSums.map(fan => fan.name);
			}*/
			
			const flowNodes = new Set(flowFans
				.map(node => node.targets)
				.reduce((a, b) => a.concat(b), []));
			
			if (flowNodes.size === 0)
				return false;
			
			// Move the cursor far enough to the right so that
			// it clears other turns to the left of it.
			x = getTotalWidth();
			
			// Before you plot, you need to yield all the way out,
			// I think even to the type checker. This is because you
			// can't just plot something that potentially has bogus
			// annotations. You want to make sure that you can
			// rely on everything being plotted. The tryPlunge and
			// tryFlow functions should return other functions that
			// get executed after the way has already been cleared
			// by the type checker (and possibly other agents).
			
			plot(new X.FansTurn(flowFans));
			unflownTurnStack.push([x, y]);
			logMatrix(matrix);
			return true;
			
			/*
			DEPRECATION: All of this code is dead. This isn't how you
			check for circular references. Circular references are checked
			when you resolve an entanglement, and the type you're trying
			to apply to the entangement is already in the directive.
			
			// We can easily check for circular references by determining
			// if any of the nodes about to be plotted already exist in the
			// terrace, to the left of the current cursor position. We only
			// need to do this when we're 1 level past the directive, and
			// this needs to stop at the previous terminal (it doesn't 
			// necessarily go all the way back to the beginning).
			if (x > 0)
			{
				const row = matrix[y];
				const preceedingTurns = row
					.filter((t): t is X.NodesTurn => t !== undefined)
					.slice(0, x - 1);
				
				row.reduce
				
				const terminalIdx = (() =>
				{
					for (let i = preceedingTurns.length; i-- > 0;)
						if (preceedingTurns[i].terminal)
							return i + 1;
					
					return 0;
				})();
				
				preceedingTurns.splice(0, terminalIdx);
				
				// Stores the set of nodes that were found to have already
				// been plotted to the left of the cursor. In an fault-free
				// document, this array is always empty.
				const preExistingNodes = new Set<X.Node>();
				
				for (const preceedingTurn of preceedingTurns)
					for (const preceedingNode of preceedingTurn.nodes)
						if (flowNodes.has(preceedingNode))
							preExistingNodes.add(preceedingNode);
				
				// Any node that was found to be pre-existing can't be
				// plotted on the waterfall, because doing so would
				// cause an infinite loop of flowing. Instead, these need
				// to be reported as faults.
				for (const preExistingNode of preExistingNodes)
				{
					if (flowNodes.has(preExistingNode))
					{
						for (const decl of preExistingNode.declarations)
						{
							const span = decl instanceof X.Span ?
								decl : 
								decl.containingSpan;
							
							const fault = X.Faults.CircularTypeReference.create(span);
							program.faults.report(fault);
						}
						
						flowNodes.delete(preExistingNode);
					}
				}
			}
			.*/
		}
		
		/**
		 * Positions a Node in the matrix at the location of the cursor.
		 */
		function plot(turn: X.NodesTurn | X.FansTurn)
		{
			maybeResizeMatrix(x, y);
			const existingTurn = matrix[y][x];
			
			if (existingTurn instanceof X.NodesTurn)
			{
				if (turn instanceof X.FansTurn)
					throw X.Exception.unknownState();
				
				existingTurn.nodes.push(...turn.nodes);
			}
			else if (existingTurn instanceof X.FansTurn)
			{
				if (turn instanceof X.NodesTurn)
					throw X.Exception.unknownState();
				
				existingTurn.fans.push(...turn.fans);
			}
			else matrix[y][x] = turn;
		}
		
		/**
		 * Ensures that the matrix is as least as tall
		 * and wide as the specified dimensions.
		 */
		function maybeResizeMatrix(desiredX: number, desiredY: number)
		{
			// Make sure there is a slot in the matrix
			// before the node is plotted.
			if (desiredY >= matrix.length)
				matrix.push(new Array(getTotalWidth()));
			
			if (desiredX >= getTotalWidth())
				for (const terrace of matrix)
					terrace.push(undefined);
		}
		
		/**
		 * Returns an array containing the nodes that have been
		 * plotted on the matrix and the current cursor location.
		 * 
		 * In the case when a NodesTurn is located at the cursor
		 * location, the nodes of this turn are returned.
		 * 
		 * In the case when a FansTurn is located at the cursor
		 * location, the nodes targeted by these fans are returned.
		 * 
		 * In the case when the cursor location points to an undefined
		 * value, an error is generated.
		 */
		function getCursorNodes()
		{
			const terrace = matrix[y];
			if (x >= terrace.length)
				throw X.Exception.unknownState();
			
			const turn = terrace[x];
			
			if (turn instanceof X.NodesTurn)
				return turn.nodes;
			
			if (turn instanceof X.FansTurn)
				return turn.fans
					.filter((f): f is X.Fan => f instanceof X.Fan)
					.map(f => f.targets)
					.reduce((a, b) => a.concat(b), [])
					.filter((v, i, a) => a.indexOf(v) === i);
			
			throw X.Exception.unknownState();
		}
		
		/** */
		function getCursorTurn()
		{
			const terrace = matrix[y];
			if (x >= terrace.length)
				throw X.Exception.unknownState();
			
			const turn = terrace[x];
			if (turn === undefined)
				throw X.Exception.unknownState();
			
			return turn;
		}
		
		plotLoop: for (;;)
		{
			while (tryPlunge());
			
			while (unflownTurnStack.length > 0)
				if (tryFlow())
					continue plotLoop;
			
			break;
		}
		
		// Debugging code to bring the
		// logMatrix() function into scope.
		logMatrix(matrix);
		
		return new X.Waterfall(directive, matrix);
	}
}

/** */
type Terrace = (X.NodesTurn | X.FansTurn | undefined)[];


/**
 * Logs the specified matrix as a call to console.table()
 */
function logMatrix(matrix: (X.Turn | undefined)[][])
{
	const table: string[][] = [];
	
	for (const row of matrix)
	{
		const tableRow: string[] = [];
		table.push(tableRow);
		
		for (const col of row)
		{
			tableRow.push((() =>
			{
				if (col instanceof X.NodesTurn)
					return col.nodes.map(n =>
						n === undefined ? "un" :
						typeof n === "string" ? n :
						n.name).join(", ") + " N";
			
				else if (col instanceof X.FansTurn)
					return col.fans.map(f => f === undefined ? "un" : f.name).join(", ") + " F";
				
				return "";
			})());
		}
	}
	
	console.table(table);
}
