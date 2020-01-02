
namespace Truth
{
	/**
	 * @internal
	 * A class that detects circular relationships between
	 * inter-referencing documents, and handles the reporting
	 * and resolution of the necessary faults when circular
	 * relationships are detected and resolved.
	 * Instances of this class are owned by a Program instance,
	 * and each Program owns exactly one CycleDetector.
	 */
	export class CycleDetector
	{
		constructor(private readonly program: Program) { }
		
		/**
		 * Informs the CycleDetector that a referentially-significant 
		 * statement (meaning that it was having an effect on the graph
		 * of  connected documents) was deleted from a document.
		 * 
		 * @returns A boolean value indicating whether faults were
		 * reported to the FaultService.
		 */
		didDelete(statement: UriStatement)
		{
			let hasFaults = false;
			
			for (let i = this.cycles.length; i-- > 0;)
			{
				const faults = this.cycles[i];
				if (faults.map(v => v.statement).includes(statement))
				{
					this.cycles.splice(i, 1);
					
					for (const fault of faults)
						this.program.faults.resolveManual(fault);
					
					hasFaults = true;
				}
			}
			
			return hasFaults;
		}
		
		/**
		 * Informs the CycleDetector that a referentially-significant 
		 * statement (meaning that it was having an effect on the graph
		 * of  connected documents) was added to a document.
		 * 
		 * @returns A boolean value indicating whether faults were
		 * reported to the FaultService.
		 */
		didAdd(statement: UriStatement)
		{
			let hasFaults = false;
			const startingDocument = statement.document;
			
			// The algorithm tracks the documents that have been visited,
			// and terminates the traversal when visited documents are
			// discovered. This is to prevent stack overflows.
			const visited: Document[] = [];
			
			// The output of the recurse function below is a series of document
			// pairs, where the first document contains the statement that is
			// responsible for the introduction of the reference, and the second
			// document is the one being targetted by said reference. 
			const discoveredDocPairs: [Document, Document][][] = [];
			
			// While the recurse function is operating, it keeps track of a stack
			// of pairs (roughly corresponding to the call stack of the recurse
			// function). The stack is then copied to the discoveredDocPairs
			// array in the case that the stack is found to be a circular relationship.
			const stackPairs: [Document, Document][] = [];
			
			const recurse = (srcDoc: Document, dstDoc: Document) =>
			{
				// Don't follow previously visited destination documents.
				if (visited.includes(dstDoc))
					return;
				
				// Found a cycle, add any new cyclical contributors
				// found in the current stack to the array.
				if (dstDoc === startingDocument)
				{
					const pair = stackPairs.slice();
					pair.push([srcDoc, dstDoc]);
					discoveredDocPairs.push(pair);
					visited.push(dstDoc);
					return;
				}
				
				stackPairs.push([srcDoc, dstDoc]);
				
				for (const dependencyDoc of dstDoc.dependencies)
					recurse(dstDoc, dependencyDoc);
				
				stackPairs.pop();
			};
			
			for (const dependency of startingDocument.dependencies)
				recurse(statement.document, dependency);
			
			// The discoveredDocPairs array is converted into a proper cycle,
			// (an array of faults), before being stored.
			for (const cyclePair of discoveredDocPairs)
			{
				const faults: Fault<Statement>[] = [];
				for (const [srcDoc, dstDoc] of cyclePair)
				{
					const smt = srcDoc.getStatementCausingDependency(dstDoc);
					if (smt)
					{
						const fault = Faults.CircularResourceReference.create(smt);
						faults.push(fault);
						this.program.faults.reportManual(fault);
						hasFaults = true;
					}
				}
				
				this.cycles.push(faults);
			}
			
			return hasFaults;
		}
		
		/**
		 * Stores the array of cycles that were discovered in the program.
		 */
		private readonly cycles: Cycle[] = [];
	}
	
	/**
	 * A "cycle" is defined as an array of StatementFaults, that loosely
	 * form a connected series of inter-referencing documents when
	 * considering the fault's associated statement and this statement's
	 * containing document.
	 * 
	 * The series does not necessarily form a simple linear chain. There
	 * may be many possible pathways forming the circular relationship.
	 * For example, if we consider a upward-pointing diamond-shaped 
	 * dependency pattern, and then we further suppose that the top
	 * node of the diamond is connected to the bottom node, this would
	 * form a circular relationship with multiple pathways. 
	 * 
	 * Additionally, it's possible that some document relationship
	 * structures could actually present a sitation where there are an
	 * infinite number of unique pathways to traverse from a starting
	 * document back to itself. This would occur in the case when we 
	 * have a simple circular relationship that is also joined to another
	 * nested circular relationship, which forms a kind of whirlpool.
	 * 
	 * For this reason, a cycle is stored as simply all the faults that
	 * compose the cycle itself, and the specific pathways that may
	 * be contributing aren't available. Conveniently, StatementFault
	 * objects store a Statement object, and Statement objects store
	 * a Document, and so from an array of Fault objects, the system
	 * is able to discover the information it needs.
	 */
	type Cycle = StatementFault[];
}
