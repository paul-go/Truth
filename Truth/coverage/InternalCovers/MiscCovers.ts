
namespace Truth
{
	async function coverSimpleTypeCheck()
	{
		const [doc, program] = await createLanguageCover(`
			number
			/\\d+ : number
			decimal : number
			struct
				n : number
			s1 : struct
				n : 1
		`);
		
		const [s1n] = typesOf(doc,
			["s1", "n"]
		);
		
		const isInerrant = program.verify();
		
		return [
			() => isInerrant,
			() => s1n.value === "123"
		];
	}
	
	async function coverThirdLevelValue()
	{
		const [doc, program] = await createLanguageCover(`
			number
			/\\d+ : number
			decimal : number
			struct
				n
					min : number
			s1 : struct
				n
					min : 3
		`);
		
		const [s1n] = typesOf(doc,
			["s1", "n", "min"]
		);
		
		const isInerrant = program.verify();
		
		return [
			() => isInerrant,
			() => s1n.value === "3"
		];		
	}
	
	async function coverInsertsAtEndOfDocument()
	{
		const [doc] = await createLanguageCover(`
			any
			object : any
			string : any
			number : any
			bigint : any
			boolean : any
			
			/".+" : string
			/(\+|-)?(([1-9]\d{0,17})|([1-8]\d{18})|(9[01]\d{17})) : number
			/(0|([1-9][0-9]*)) : bigint
			/(true|false) : boolean

			Product
				Name: string
				Size: number

			data
				001 : Product
					Name: "Test"
					Size: 1234
					
				002 : Product
					Name: "Test"
					Size: 123
				
				003 : Product
					Name: "Test3"
					Size: 123
		`);
		
		await doc.edit(mutator =>
		{
			mutator.insert("	004 : Product", -1);
			mutator.insert("		Name : \"Test4\"", -1);
			mutator.insert("		Size : 123", -1);
		});
		
		return () => true;
	}
	
	async function coverEditAtomic()
	{
		const [doc] = await createLanguageCover(`abc`);
		
		await doc.editAtomic([
			{
				range: {
					startLineNumber: 1,
					startColumn: 3,
					endColumn: 3,
					endLineNumber: 1
				},
				text: "\n"
			}
		]);
		
		return () => true;
	}
}
