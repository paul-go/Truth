
namespace Cover
{
	/** */
	export async function coverEditWithSingleUpdate()
	{
		const doc = await Truth.parse(outdent`
			X
		`);
		
		if (doc instanceof Error)
			return doc;
		
		doc.edit(types =>
		{
			types.update("Y", 0);
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
		
		doc.edit(types =>
		{
			// Should do nothing
			types.update("X", 0);
			
			// Should update
			types.update("YY", 1);
			
			// Should do a double update
			types.update("ZZ", 2);
			types.update("ZZZ", 2);
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
		
		doc.edit(types =>
		{
			types.insert("B", 1);
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
		
		doc.edit(types =>
		{
			types.delete(0, 1);
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
		
		doc.edit(types =>
		{
			types.delete(1, 1);
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
		
		doc.edit(types =>
		{
			types.delete(1, 2);
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
		
		doc.edit(types =>
		{
			// Delete "B"
			types.delete(1, 1);
			
			// Delete "F", which is now one index back
			types.delete(3, 1);
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
		
		doc.edit(types =>
		{
			types.update("	DidUpdate", 1);
			types.delete(2, 2);
			types.update("	DidUpdate", 2);
			types.insert("	DidInsert", 1);
			types.insert("	DidInsert", 10);
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
