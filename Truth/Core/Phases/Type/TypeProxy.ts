import * as X from "../../X";


/**
 * @internal
 */
export class TypeProxy
{
	/** */
	constructor(
		private readonly uri: X.Uri,
		private readonly program: X.Program)
	{ }
	
	/** */
	maybeCompile()
	{
		if (this.compiledType !== undefined)
			return this.compiledType;
		
		return this.compiledType = X.Type.construct(this.uri, this.program);
	}
	
	/** */
	private compiledType: X.Type | null | undefined = undefined;
}
