import * as X from "./X";


/**
 * Provides an entry point for enumeration through
 * the types defined in a program.
 */
export class ProgramAnalyzer
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
				
				const typesAtThisStatement = statement.declarations
					.map(decl => decl.factor())
					.reduce((spines, s) => spines.concat(s))
					.map(spine => X.Type.get(spine));
				
				for (const type of typesAtThisStatement)
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
	 * Enumerate through all types defined in the Program.
	 */
	*enumerate(filterDocument?: X.Document)
	{
		function* recurse(type: X.Type, document: X.Document)
		{
			yield { type, document };
			
			
			
			for (const containedType of type.contents)
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
	}
	
	/** */
	private readonly roots = new Map<X.Document, Map<string, X.Type>>();
}
