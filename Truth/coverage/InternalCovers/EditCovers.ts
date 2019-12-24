
namespace Truth
{
	/** */
	function coverEditWithSingleUpdate()
	{
		const program = new Program();
		const doc = program.documents.create(outdent`
			X
		`);
		
		doc.edit(facts =>
		{
			facts.update("Y", 0);
		});
		
		const documentText = doc.toString();
		return () => documentText === "Y";
	}
	
	/** */
	function coverEditWithMultipleUpdates()
	{
		const program = new Program();
		const doc = program.documents.create(outdent`
			X
			Y
			Z
		`);
		
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
	function coverEditWithSingleInsert()
	{
		const program = new Program();
		const doc = program.documents.create(outdent`
			A
		`);
		
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
	function coverEditWithMultipleInserts()
	{
		return () => true;
	}

	/** */
	function coverEditSimpleDelete()
	{
		const program = new Program();
		const doc = program.documents.create(outdent`
			A
		`);
		
		doc.edit(facts =>
		{
			facts.delete(0, 1);
		});
		
		const documentText = doc.toString();
		return () => documentText === "";
	}

	/** */
	function coverEditParentDeletion()
	{
		const program = new Program();
		const doc = program.documents.create(outdent`
			A
				B
					C
					D
				F
		`);
		
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
	function coverEditNestedParentDeletion()
	{
		const program = new Program();
		const doc = program.documents.create(outdent`
			A
				B
					C
						D
				F
		`);
		
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
	function coverEditMultipleNestedParentDeletion()
	{
		const program = new Program();
		const doc = program.documents.create(outdent`
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
	function coverEditUpdateInsertDelete()
	{
		const program = new Program();
		const doc = program.documents.create(outdent`
			Container
				WillUpdate
				WillDelete
				WillDelete
				WillUpdate
		`);
		
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
