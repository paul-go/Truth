import * as X from "./X";


/*

The Type class deals with the following concerns
on top of what is already provided by the Node class:

- Polymorphic type resolution
- Calculating type contracts
- Fault reporting
- Resolving aliases
- Circular inheritance detection

*/


export class TypeConstructor
{
	/**
	 * 
	 */
	static invoke(uri: X.Uri)
	{
		if (uri.typePath.length === 0)
			return null;
		
		const typeContainerAncestry: X.Type[] = [];
		let tipType: X.Type | null = null;
		
		for (const typeName of uri.typePath)
		{
			tipType = typeContainerAncestry.length > 0 ?
				typeContainerAncestry[typeContainerAncestry.length - 1] :
				null;
			
			const nextType = this.constructLevel(tipType, typeName);
			if (!nextType)
				return null;
			
			typeContainerAncestry.push(nextType);
		}
		
		return tipType;
	}
	
	/**
	 * Constructs one single level of a type object, under the assumption that all
	 * types in the containment ancestry have been constructed.
	 */
	private static constructLevel(container: X.Type | null, name: string): X.Type | null
	{
		// First order of business is to deal with specified
		// and unspecified areas
		
		// Then you need to de-inference any inferrable annotations.
		
		return null;
	}
	
	/**
	 * 
	 */
	private static analyzeLevel(type: X.Type)
	{
		
	}
}
