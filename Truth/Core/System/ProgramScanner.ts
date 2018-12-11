import * as X from "../X";


/**
 * Provides an entry point for enumeration through
 * the types defined in a program.
 */
export class ProgramScanner
{
	/** @internal */
	constructor(private program: X.Program)
	{
		for (const document of program.documents.each())
		{
			const types = new Map<string, X.Type>();
			
			for (const { statement, level } of document.eachDescendant())
			{
				if (level > 0)
					continue;
				
				const typesAtStatement = statement.declarations
					.map(decl => decl.factor())
					.reduce((spines, s) => spines.concat(s))
					.map(spine => X.Type.construct(spine, program));
				
				for (const type of typesAtStatement)
					types.set(type.name, type);
			}
			
			if (types.size)
				this.roots.set(document, types);
		}
		
		// Call this method so that all types are visited,
		// which will cause all faults to be reported across
		// the entire Program.
		this.enumerate();
	}
	
	/**
	 * Enumerate through all visible types defined in the Program.
	 */
	*enumerate(filterDocument?: X.Document)
	{
		// Method not implemented.
		// Does this need to change to use the
		// new document URI traversal feature?
		
		yield {
			type: <X.Type>null!, 
			document: <X.Document>null!
		};
		
		/*
		function* recurse(type: X.Type, document: X.Document)
		{
			yield { type, document };
			
			for (const containedType of type.contentsSpecified)
				recurse(containedType, document);
		}
		
		if (filterDocument)
		{
			if (this.program.documents.has(filterDocument))
				throw X.ExceptionMessage.documentNotLoaded();
			
			const map = this.roots.get(filterDocument);
			if (!map)
				throw X.ExceptionMessage.documentNotLoaded();
			
			for (const type of map.values())
				yield recurse(type, filterDocument);
		}
		else for (const [document, types] of this.roots)
			for (const type of types.values())
				yield recurse(type, document);
		.*/
	}
	
	/** */
	private readonly roots = new Map<X.Document, Map<string, X.Type>>();
}
