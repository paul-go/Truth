import * as X from "../X";


/**
 * A graph of types, indexed by their URIs.
 */
export class TypeGraph
{
	/** */
	constructor(private readonly program: X.Program)
	{
		
	}
	
	/** */
	private readonly roots = new Map<X.Document, Type>();
}


class Type
{
	/** */
	readonly name: X.Subject = null!;
	
	/** Containers? */
	readonly container: X.Type = null!;
	
	/** */
	readonly has: Type[] = [];
	
	/** */
	readonly is: Type[] = [];
	
	/** */
	readonly isThis: Type[] = [];
	
	// Is this a type? Or a regex?
	readonly matches: Type[] = [];
	
	/** */
	readonly insights = new Insights(this);
}


/**
 * 
 */
class Insights
{
	constructor(readonly type: Type) { }
	
	//
	// Stuff I'm not sure about:
	// Does this stuff still make sense in the URI graph?
	//
	
	/** */
	readonly isFresh = false;
	
	readonly isOverride = false;
	
	readonly isIntroduction = false;
}

