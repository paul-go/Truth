import * as X from "./X";


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
		subject: X.Subject | null,
		atDeclaration: boolean,
		atAnnotation: boolean,
		offsetStart: number)
	{
		this.statement = statement;
		this.subject = subject || generateInvisibleSubject();
		this.atDeclaration = atDeclaration;
		this.atAnnotation = atAnnotation;
		this.offsetStart = offsetStart;
		this.offsetEnd = offsetStart + (subject ? subject.toString().length : 0);
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
			throw X.ExceptionMessage.unknownState();
		
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
	readonly subject: X.Subject | string;
	
	/** */
	readonly atDeclaration: boolean;
	
	/** */
	readonly atAnnotation: boolean;
	
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
		
		// We need to factor the ancestry. This means we're taking the
		// specified ancestry path, and splitting where any has-a side unions
		// exist, in effect creating all possible paths to the specified tip.
		const factoredSpanPaths: X.Span[][] = [];
		
		// An array of arrays. The first dimension is the hasa terms in a
		// particular statement. The second dimension is the hasa terms
		// themselves.
		const ancestrySpans = this.ancestry.map(stmt => Array.from(stmt.declarations));
		
		// An array that stores the number of hasa terms in each statement.
		const ancestryLengths = ancestrySpans.map(span => span.length);
		
		// Multiplying together the number of terms in each statement will give
		// us the total number of term paths that we're going to end up with.
		const numFactoredSpanPaths = ancestryLengths.reduce((a, b) => a * b);
		
		// Start with an array of 0's, whose length matches the number
		// of statements in the ancestry. Each number in this array will be 
		// incremented by 1, from right to left, each number maxing out at
		// the number of has-a terms in the ancestor. After each incrementation,
		// the progression of numbers will run through all indexes required to
		// perform a full factorization of the terms in the ancestry.
		const cherryPickIndexes = ancestryLengths.map(() => 0);
		
		// Stores the position in insertionIndexes that we're currently
		// incrementing by 1. Moves backward when the number at 
		// the target position is >= the number of terms at that position.
		let targetIncPos = cherryPickIndexes.length - 1;
		
		for (let i = -1; ++i < numFactoredSpanPaths;)
		{
			// Do an insertion at the indexes specified by insertionIndexes
			const spanPath: X.Span[] = [];
			
			// Cherry pick a series of terms from the ancestry terms,
			// according to the index set we're currently on.
			cherryPickIndexes.forEach((insertionIndex, pos) =>
				spanPath.push(ancestrySpans[pos][insertionIndex]));
			
			// The tip span specified in the method arguments
			// is added at the end of all generated span paths.
			spanPath.push(this);
			factoredSpanPaths.push(spanPath);
			
			if (cherryPickIndexes[targetIncPos] >= ancestryLengths[targetIncPos])
				targetIncPos--;
			
			cherryPickIndexes[targetIncPos]++;
		}
		
		return this.factoredSpines = 
			Object.freeze(factoredSpanPaths.map(spanPath => 
				new X.Spine(spanPath)));
	}
	
	/**  */
	private factoredSpines: ReadonlyArray<X.Spine> | null = null;
}


/** */
function generateInvisibleSubject()
{
	const charCount = 40;
	const result: string[] = [];
	
	for (let i = -1; ++i < charCount;)
	{
		let code = 48 + (Math.random() * 62) | 0;
		
		if (code < 57)
			code += 7;
		
		if (code < 90)
			code += 6;
		
		result.push(String.fromCharCode(code));
	}
	
	return result.join("");
}
