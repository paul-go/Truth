
namespace Truth
{
	/** */
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
		printPhrases(document: Document, includeClarifiers = false)
		{
			type Row = { phrase: string, clarifiers?: string };
			const rows: Row[] = [];
			
			for (const phrase of document.phrase.eachDescendant())
			{
				const row: Row = { phrase: phrase.toString() };
				rows.push(row);
				
				if (includeClarifiers)
					row.clarifiers = phrase.clarifiers.map(term => term.toString()).join();
			}
			
			console.table(rows);
		}
	}
}
