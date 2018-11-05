import * as X from "./X";


/**
 * Mines a Chart for bases. Produces a set of interconnected
 * BaseInfo objects that represent the Supergraph.
 */
export class SuperLinkMiner
{
	/** */
	constructor(private readonly defragmenter: X.Defragmenter)
	{
		
	}
	
	/** */
	mine(uri: X.Uri, hotPath?: X.Uri): SuperLink[] | null
	{
		if (!uri.typePath)
			throw X.ExceptionMessage.invalidArgument();
			
		const initialLookup = this.defragmenter.lookup(uri, X.TargetedLookup);
		if (!initialLookup)
			throw X.ExceptionMessage.invalidArgument();
		
		const uriText = uri.toString();
		
		if (this.miningResults.has(uriText))
			return this.miningResults.get(uriText) || null;
		
		// Nothing has been mined for this type.
		// Time to roll the sleeves up.
		
		
		
		return [];
	}
	
	/** */
	private doRecursiveDescendingLookup(uri: X.Uri)
	{
		
		const recurse = (uri: X.Uri) =>
		{
			const tgtLookup = this.defragmenter.lookup(uri, X.TargetedLookup)!;
			
		}
		
		recurse(uri);
	}
	
	/**
	 * Stores a map of previously mined typed,
	 * indexed by their associated Type URI.
	 */
	private readonly miningResults = new Map<string, SuperLink[] | null>();
}




/**
 * A class that links a URI to other URIs that store the base.
 */
export class SuperLink
{
	/** */
	readonly from: X.Uri = null!;
	
	/** */
	readonly to: ReadonlySet<X.Uri> = new Set();
}
