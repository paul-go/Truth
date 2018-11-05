import * as X from "./X";


/**
 * A class that carries out the type construction process.
 */
export class TypeConstructor
{
	/** */
	constructor(private readonly defragmenter: X.Defragmenter)
	{
		
	}
	
	/** */
	exec(spine: X.Spine)
	{
		// Collects all annotations that have been applied to
		// the type referenced by the specified pointer, and
		// produce an array of types representing the collected
		// annotations, but with any redundant types pruned.
		const tgtLookup = this.defragmenter.lookup(spine, X.TargetedLookup);
		
		// If there are no annotations, the next step is to attempt
		// to infer the type, starting by exploring the Supergraph.
		// When that fails, we fall back to working our way up the
		// ancestry. And if that fails, the type is marked as Fresh.
		
		return new X.Type([]);
	}
	
	/** */
	private tryInference(annotations: X.Pointer[])
	{
		
	}
}
