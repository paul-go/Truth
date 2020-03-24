
namespace Truth
{
	/** @interal */
	export const Debug = "DEBUG" && new class Debug
	{
		/**
		 * Prints the contents of the document as it's stored internally,
		 * with all line numbers
		 */
		printDocument(document: Document)
		{
			console.log(document.toString(true, true));
		}
		
		/**
		 * Logs all phrases associated with the specified document to a table.
		 */
		printPhrases(document: Document, includeClarifiers = false, includeInflations = false)
		{
			type Row = { phrase: string, clarifiers?: string, inflations?: number };
			const rows: Row[] = [];
			
			for (const phrases of document.phrase.peekRecursive())
			{
				for (const phrase of phrases)
				{
					const row: Row = { phrase: phrase.toString() };
					rows.push(row);
					
					if (includeClarifiers)
						row.clarifiers = phrase.clarifiers.map(term => term.toString()).join();
					
					if (includeInflations)
						row.inflations = phrase.inflationSize;
				}
			}
			
			console.table(rows);
		}
		
		/**
		 * Logs a set of parallels to the console.
		 */
		printParallels(parallels: Iterable<Parallel>)
		{
			let count = 0;
			
			for (const par of parallels)
				console.log((count++) + "| " + par.toString());
			
			if (count === 0)
				console.log("(No parallels found)");
			
			console.log("");
		}
	}
}
