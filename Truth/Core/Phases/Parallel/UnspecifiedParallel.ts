import * as X from "../../X";


/**
 * 
 */
export class UnspecifiedParallel extends X.Parallel
{
	/**
	 * @internal
	 * Invoked by ParallelCache. Do not call.
	 */
	constructor(
		uri: X.Uri,
		container: X.Parallel | null)
	{
		super(uri, container);
	}
	
	/**
	 * Avoids erroneous structural type compatibility with Parallel.
	 */
	private readonly unique: undefined;
}
