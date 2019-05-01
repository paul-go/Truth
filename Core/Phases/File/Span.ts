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
	
	/**
	 * @internal
	 */
	constructor(
		/**
		 * Stores a reference to the Statement that contains this Span.
		 */
		readonly statement: X.Statement,
		
		/**
		 * Stores the subject, and the location of it in the document.
		 */
		readonly boundary: X.Boundary<X.Subject>)
	{
		this.name = 
			X.SubjectSerializer.forInternal(boundary) + 
			` (${boundary.offsetStart}, ${boundary.offsetEnd})`;
	}
	
	/**
	 * Stores a string representation of this Span, useful for debugging.
	 */
	private readonly name: string;
	
	/**
	 * Gets the Infixes stored within this Span, in the case when
	 * the Span corresponds to a Pattern. In other cases, and
	 * empty array is returned.
	 */
	get infixes()
	{
		return this._infixes || (this._infixes = Object.freeze((() =>
		{
			return this.boundary.subject instanceof X.Pattern ?
				Array.from(this.boundary.subject.getInfixes()) :
				[];
		})()));
	}
	private _infixes: ReadonlyArray<X.Infix> | null = null;
	
	/** */
	*eachDeclarationForInfix(infix: X.Infix)
	{
		if (!this.infixes.includes(infix))
			throw X.Exception.invalidCall();
		
		const { lhs } = this.queryInfixSpanTable(infix);
		for (const infixSpan of lhs)
			yield infixSpan;
	}
	
	/** */
	*eachAnnotationForInfix(infix: X.Infix)
	{
		if (!this.infixes.includes(infix))
			throw X.Exception.invalidCall();
		
		const { rhs } = this.queryInfixSpanTable(infix);
		for (const infixSpan of rhs)
			yield infixSpan;
	}
	
	/** */
	private queryInfixSpanTable(infix: X.Infix)
	{
		return this.infixSpanTable.get(infix) || (() =>
		{
			const lhs: X.InfixSpan[] = [];
			const rhs: X.InfixSpan[] = [];
			
			for (const boundary of infix.lhs)
				lhs.push(new X.InfixSpan(this, infix, boundary));
			
			for (const boundary of infix.rhs)
				rhs.push(new X.InfixSpan(this, infix, boundary));
			
			return { lhs, rhs };
		})();
	}
	
	/** */
	private readonly infixSpanTable = new Map<X.Infix, { lhs: X.InfixSpan[]; rhs: X.InfixSpan[] }>();
	
	/**
	 * Gets an array of statements that represent the statement
	 * containment progression, all the way back to the containing
	 * document.
	 */
	get ancestry()
	{
		if (this._ancestry)
			if (this._ancestry.every(smt => !smt.isDisposed))
				return this._ancestry;
		
		// If the ancestry has no yet been computed, or it has, but at least of
		// it's statements have been disposed, then it must be recomputed.
		this._ancestry = this.statement.document.getAncestry(this.statement);
		if (!this._ancestry)
			throw X.Exception.unknownState();
		
		return this._ancestry;
	}
	private _ancestry: ReadonlyArray<X.Statement> | null = null;
	
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
		
		if (this.isCruft || this.statement.isCruft)
			return this.factoredSpines = Object.freeze([]);
		
		if (this.ancestry.length === 0)
			return this.factoredSpines = Object.freeze([new X.Spine([this])]);
		
		// We need to factor the ancestry. This means we're taking the
		// specified ancestry path, and splitting where any has-a side unions
		// exist, in effect creating all possible paths to the specified tip.
		// It's possible to have statements in the span path in the case
		// when the statement has been deemed as cruft, and therefore,
		// is impossible to extract any spans from it.
		const factoredSpanPaths: (X.Span | X.Statement)[][] = [];
		
		// An array of arrays. The first dimension corresponds to a statement. 
		// The second dimension stores the declaration spans themselves.
		const ancestryMatrix = this.ancestry.map(smt => Array.from(smt.declarations));
		
		// An array that stores the number of declaration spans in each statement.
		const ancestryLengths = ancestryMatrix.map(span => span.length);
		
		// Multiplying together the number of spans in each statement will
		// give the total number of unique spines that will be produced.
		const numSpines = ancestryLengths.reduce((a, b) => a * b, 1);
		
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
			const spanPath: (X.Span | X.Statement)[] = [];
			
			// Cherry pick a series of terms from the ancestry terms,
			// according to the index set we're currently on.
			for (let level = -1; ++level < this.ancestry.length;)
			{
				const statement = this.ancestry[level];
				if (statement.isCruft)
				{
					spanPath.push(statement);
					continue;
				}
				
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
			// and keep doing this until we find a number
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
	
	/**
	 * Gets a boolean value that indicates whether this Span is considered
	 * object-level cruft, and should therefore be ignored during type analysis.
	 */
	get isCruft()
	{
		return this.statement.cruftObjects.has(this);
	}
	
	/**
	 * Converts this Span to a string representation.
	 * 
	 * @param includeCrcPrefix If the subject inside this Span is a
	 * Pattern, and this argument is true, the Pattern's CRC prefix
	 * will be prepended to the serialized result.
	 */
	toString(includeCrcPrefix?: boolean)
	{
		const sub = this.boundary.subject;
		return sub instanceof X.Pattern ?
			sub.toString(!!includeCrcPrefix) :
			sub.toString();
	}
}
