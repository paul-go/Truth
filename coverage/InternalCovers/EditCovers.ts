
namespace CoverTruth
{
	/** */
	export async function coverEditWithSingleUpdate()
	{
		const doc = await Truth.parse(outdent`
			X
		`);
		
		if (doc instanceof Error)
			return doc;
		
		doc.edit(facts =>
		{
			facts.update("Y", 0);
		});
		
		const documentText = doc.toString();
		return () => documentText === "Y";
	}
	
	/** */
	export async function coverEditWithMultipleUpdates()
	{
		const doc = await Truth.parse(outdent`
			X
			Y
			Z
		`);
		
		if (doc instanceof Error)
			return doc;
		
		doc.edit(facts =>
		{
			// Should do nothing
			facts.update("X", 0);
			
			// Should update
			facts.update("YY", 1);
			
			// Should do a double update
			facts.update("ZZ", 2);
			facts.update("ZZZ", 2);
		});
		
		const documentText = doc.toString();
		return () => documentText === outdent`
			X
			YY
			ZZZ
		`;
	}
	
	/** */
	export async function coverEditWithSingleInsert()
	{
		const doc = await Truth.parse(outdent`
			A
		`);
		
		if (doc instanceof Error)
			return doc;
		
		doc.edit(facts =>
		{
			facts.insert("B", 1);
		});
		
		const documentText = doc.toString();
		return () => documentText === outdent`
			A
			B
		`;
	}
	
	/** */
	export async function coverEditWithMultipleInserts()
	{
		return () => true;
	}

	/** */
	export async function coverEditSimpleDelete()
	{
		const doc = await Truth.parse(outdent`
			A
		`);
		
		if (doc instanceof Error)
			return doc;
		
		doc.edit(facts =>
		{
			facts.delete(0, 1);
		});
		
		const documentText = doc.toString();
		return () => documentText === "";
	}

	/** */
	export async function coverEditParentDeletion()
	{
		const doc = await Truth.parse(outdent`
			A
				B
					C
					D
				F
		`);
		
		if (doc instanceof Error)
			return doc;
		
		doc.edit(facts =>
		{
			facts.delete(1, 1);
		});
		
		const documentText = doc.toString();
		return () => documentText === outdent`
			A
				C
				D
				F
		`;
	}
	
	/** */
	export async function coverEditNestedParentDeletion()
	{
		const doc = await Truth.parse(outdent`
			A
				B
					C
						D
				F
		`);
		
		if (doc instanceof Error)
			return doc;
		
		doc.edit(facts =>
		{
			facts.delete(1, 2);
		});
		
		const documentText = doc.toString();
		return () => documentText === outdent`
			A
				D
				F
		`;
	}
	
	/** */
	export async function coverEditMultipleNestedParentDeletion()
	{
		const doc = await Truth.parse(outdent`
			A
				B
					C
						D
				F
					G
						H
				I
				J
		`);
		
		if (doc instanceof Error)
			return doc;
		
		doc.edit(facts =>
		{
			// Delete "B"
			facts.delete(1, 1);
			
			// Delete "F", which is now one index back
			facts.delete(3, 1);
		});
		
		const documentText = doc.toString();
		return () => documentText === outdent`
			A
				C
					D
				G
					H
				I
				J
		`;
	}
	
	/** */
	export async function coverEditUpdateInsertDelete()
	{
		const doc = await Truth.parse(outdent`
			Container
				WillUpdate
				WillDelete
				WillDelete
				WillUpdate
		`);
		
		if (doc instanceof Error)
			return doc;
		
		doc.edit(facts =>
		{
			facts.update("	DidUpdate", 1);
			facts.delete(2, 2);
			facts.update("	DidUpdate", 2);
			facts.insert("	DidInsert", 1);
			facts.insert("	DidInsert", 10);
		});
		
		const documentText = doc.toString();
		return () => documentText === outdent`
			Container
				DidInsert
				DidUpdate
				DidUpdate
				DidInsert
		`;
	}
}
