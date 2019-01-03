import * as X from "../../X";


/**
 * A class for scaling up and down a type path.
 */
export class PathCursor
{
	constructor(uri: X.Uri)
	{
		this.typePath = uri.typePath;
	}
	
	/** */
	advance()
	{
		if (!this.atEnd)
			this.cursor++;
	}
	
	/** */
	backtrack(to: number)
	{
		if (to < 0 || to >= this.cursor)
			throw X.Exception.invalidArgument();
		
		this.cursor = to;
	}
	
	/** */
	get originName() { return this.typePath[0]; }
	
	/** */
	get finalName() { return this.typePath[this.typePath.length - 1]; }
	
	/** */
	get currentName() { return this.typePath[this.cursor]; }
	
	/** */
	get nextName() { return this.atEnd ? null : this.typePath[this.cursor + 1]; }
	
	/** */
	get previousName() { return this.atStart ? null : this.typePath[this.cursor - 1]; }
	
	/** */
	get atStart() { return this.cursor === 0; }
	
	/** */
	get atEnd() { return this.cursor >= this.typePath.length - 1; }
	
	/** */
	private readonly typePath: ReadonlyArray<string>;
	
	/** */
	private cursor = 0;
}
