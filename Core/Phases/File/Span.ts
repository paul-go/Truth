import * as X from "../../X";


/**
 * A class that represents a position in a statement.
 */
export class Span
{
	/**
	 * @internal
	 * Logical clock value used to make chronological 
	 * creation-time comparisons between Spans.
	 */
	readonly stamp = X.VersionStamp.next();
	
	/** @internal */
	constructor(
		statement: X.Statement,
		offsetStart: number,
		offsetEnd: number,
		subject: X.Subject | null)
	{
		// The below check should never happen, and likely
		// wouldn't cause any errors, but it's unplanned so
		// we're checking for it here.
		if (typeof subject === "string")
			throw X.Exception.unknownState();
		
		this.statement = statement;
		this.subject = subject || new X.Anon();
		this.offsetStart = offsetStart;
		this.offsetEnd = offsetEnd;
	}
	
	/**
	 * Gets an array of statements that represent the statement
	 * containment progression, all the way back to the containing
	 * document.
	 */
	get ancestry()
	{
		if (this._ancestry)
			if (this._ancestry.every(stmt => !stmt.isDisposed))
				return this._ancestry;
		
		// If the ancestry has no yet been computed, or it has, but at least of
		// it's statements have been disposed, then it must be recomputed.
		this._ancestry = this.statement.document.getAncestry(this.statement);
		if (!this._ancestry)
			throw X.Exception.unknownState();
		
		return this._ancestry;
	}
	private _ancestry: ReadonlyArray<X.Statement> | null = null;
	
	/** Stores a reference to the Statement that contains this Span. */
	readonly statement: X.Statement;
	
	/**
	 * Stores either a reference to the instance of the Subject that this
	 * Span represents, or a unique string in the case when this is
	 * a "Thin Span" that represents an Invisible Subject.
	 */
	readonly subject: X.Subject;
	
	/**
	 * The offset in the statement that marks the start of the
	 * region being pointed to.
	 */
	readonly offsetStart: number;
	
	/**
	 * The offset in the statement that marks the end of the
	 * region being pointed to.
	 */
	readonly offsetEnd: number;
	
	/**
	 * Splits apart the groups subjects specified in the containing
	 * statement's ancestry, and generates a series of spines, 
	 * each indicating a separate pathway of declarations through
	 * the ancestry that reach the location in the document
	 * referenced by this global span object.
	 * 
	 * The generated spines are referentially opaque. Running this
	 * method on the same Span object always returns the same
	 * Spine instance.
	 */
	factor(): ReadonlyArray<X.Spine>
	{
		if (this.factoredSpines)
			return this.factoredSpines;
		
		if (this.ancestry.length === 0)
			return this.factoredSpines = Object.freeze([new X.Spine([this])]);
		
		// We need to factor the ancestry. This means we're taking the
		// specified ancestry path, and splitting where any has-a side unions
		// exist, in effect creating all possible paths to the specified tip.
		const factoredSpanPaths: X.Span[][] = [];
		
		// An array of arrays. The first dimension corresponds to a statement. 
		// The second dimension stores the declaration spans themselves.
		const ancestryMatrix = this.ancestry.map(stmt => Array.from(stmt.declarations));
		
		// An array that stores the number of declaration spans in each statement.
		const ancestryLengths = ancestryMatrix.map(span => span.length);
		
		// Multiplying together the number of spans in each statement will
		// give the total number of unique spines that will be produced.
		const numSpines = ancestryLengths.reduce((a, b) => a * b);
		
		// Start with an array of 0's, whose length matches the number
		// of statements in the ancestry. Each number in this array will be 
		// incremented by 1, from right to left, each number maxing out at
		// the number of declarations in the ancestor. After each incrementation,
		// the progression of numbers will run through all indexes required to
		// perform a full factorization of the terms in the ancestry. This array
		// tells the algorithm which indexes in ancestryMatrix to pull when
		// constructing a spine.
		const cherryPickIndexes = ancestryLengths.map(() => 0);
		
		// Stores the position in cherryPickIndexes that we're currently
		// incrementing. Moves backward when the number at 
		// the target position is >= the number of terms at that position.
		let targetIncLevel = 0;
		
		for (let i = -1; ++i < numSpines;)
		{
			// Do an insertion at the indexes specified by insertionIndexes
			const spanPath: X.Span[] = [];
			
			// Cherry pick a series of terms from the ancestry terms,
			// according to the index set we're currently on.
			for (let level = -1; ++level < this.ancestry.length;)
			{
				const spansForStatement = ancestryMatrix[level];
				const spanIndex = cherryPickIndexes[level];
				const span = spansForStatement[spanIndex];
				
				if (!span)
					throw X.Exception.unknownState();
				
				spanPath.push(span);
			}
			
			// The tip span specified in the method arguments
			// is added at the end of all generated span paths.
			spanPath.push(this);
			factoredSpanPaths.push(spanPath);
			
			// Bump up the current cherry pick index, 
			// or if we hit the roof, move to the next level,
			// and keep doing this unti we find a number
			// to increment.
			while (cherryPickIndexes[targetIncLevel] >= ancestryLengths[targetIncLevel] - 1)
				targetIncLevel++;
			
			cherryPickIndexes[targetIncLevel]++;
		}
		
		return this.factoredSpines = 
			Object.freeze(factoredSpanPaths.map(spanPath => 
				new X.Spine(spanPath)));
	}
	
	/**  */
	private factoredSpines: ReadonlyArray<X.Spine> | null = null;
}
