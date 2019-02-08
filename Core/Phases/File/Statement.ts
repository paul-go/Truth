import * as X from "../../X";


/**
 * 
 */
export class Statement
{
	/**
	 * @internal
	 * Logical clock value used to make chronological 
	 * creation-time comparisons between Statements.
	 */
	readonly stamp = X.VersionStamp.next();
	
	/**
	 * @internal
	 */
	constructor(document: X.Document, text: string)
	{
		const line = X.LineParser.parse(text);
		this.document = document;
		this.sourceText = line.sourceText;
		this.sum = line.sum;
		this.indent = line.indent;
		this.flags = line.flags;
		this.jointPosition = line.jointPosition;
		
		this.allDeclarations = Object.freeze(Array.from(line.declarations)
			.map(boundary => new X.Span(this, boundary)));
		
		this.allAnnotations = Object.freeze(Array.from(line.annotations)
			.map(boundary => new X.Span(this, boundary)));
		
		const faults: X.Fault[] = [];
		const cruftObjects = new Set<X.Statement | X.Span | X.InfixSpan>();
		
		if (line.faultType !== null)
			faults.push(new X.Fault(line.faultType, this));
		
		for (const fault of this.eachParseFault())
		{
			if (fault.type.severity === X.FaultSeverity.error)
				cruftObjects.add(fault.source);
			
			faults.push(fault);
		}
		
		for (const fault of faults)
			// Check needed to support the unit tests, the feed
			// fake document objects into the statement constructor.
			if (document.program && document.program.faults)
				document.program.faults.report(fault);
		
		this.cruftObjects = cruftObjects;
		this.faults = Object.freeze(faults);
	}
	
	/**
	 * 
	 */
	private *eachParseFault(): IterableIterator<Readonly<X.Fault<X.TFaultSource>>>
	{
		// Check for tabs and spaces mixture
		if (this.indent > 0)
		{
			let hasTabs = false;
			let hasSpaces = false;
			
			for (let i = -1; ++i < this.indent;)
			{
				const chr = this.sourceText[i];
				
				if (chr === X.Syntax.tab)
					hasTabs = true;
				
				if (chr === X.Syntax.space)
					hasSpaces = true;
			}
			
			if (hasTabs && hasSpaces)
				yield new X.Fault(X.Faults.TabsAndSpaces, this);
		}
		
		if (this.allDeclarations.length > 1)
		{
			const subjects: string[] = [];
			
			for (const span of this.allDeclarations)
			{
				const subText = span.toString();
				if (subjects.includes(subText))
					yield new X.Fault(X.Faults.DuplicateDeclaration, span);
				else
					subjects.push(subText);
			}
		}
		
		if (this.allAnnotations.length > 0)
		{
			// This performs an expedient check for "ListIntrinsicExtendingList",
			// however, full type analysis is required to cover all cases where
			// this fault may be reported.
			const getListSpans = (spans: ReadonlyArray<X.Span>) => spans.filter(span =>
			{
				const sub = span.boundary.subject;
				return sub instanceof X.Identifier && sub.isList
			});
			
			const lhsListSpans = getListSpans(this.allDeclarations);
			const rhsListSpans = getListSpans(this.allAnnotations);
			
			if (lhsListSpans.length > 0 && rhsListSpans.length > 0)
				for (const span of rhsListSpans)
					yield new X.Fault(X.Faults.ListIntrinsicExtendingList, span);
		}
		
		const pattern = (() =>
		{
			if (this.allDeclarations.length === 0)
				return null;
			
			const hp = X.LineFlags.hasPattern;
			if ((this.flags & hp) !== hp)
				return null;
			
			const subject = this.allDeclarations[0].boundary.subject
			return subject instanceof X.Pattern ?
				subject :
				null;
		})();
		
		if (pattern === null)
			return;
		
		if (!pattern.isValid)
		{
			yield new X.Fault(X.Faults.PatternInvalid, this);
			return;
		}
		
		if (this.allAnnotations.length === 0)
			yield new X.Fault(X.Faults.PatternWithoutAnnotation, this);
		
		if (pattern.test(""))
			yield new X.Fault(X.Faults.PatternCanMatchEmpty, this);
		
		if (!pattern.isTotal)
			for (const unit of pattern.eachUnit())
				if (unit instanceof X.RegexGrapheme)
					if (unit.grapheme === X.Syntax.combinator)
					{
						yield new X.Fault(X.Faults.PatternPartialWithCombinator, this);
						break;
					}
		
		const patternSpan = this.allDeclarations[0];
		if (patternSpan.infixes.length === 0)
			return;
		
		const infixSpans: X.InfixSpan[] = [];
		
		for (const infix of patternSpan.infixes)
		{
			const lhs = Array.from(patternSpan.eachDeclarationForInfix(infix));
			const rhs = Array.from(patternSpan.eachAnnotationForInfix(infix));
			const all = lhs.concat(rhs);
			
			// This is a bit out of place ... but we need to populate the
			// infixSpans array and this is probably the most efficient
			// place to do that.
			infixSpans.push(...all);
			
			for (const infixSpan of all)
				if (infixSpan.boundary.subject.isList)
					yield new X.Fault(X.Faults.InfixUsingListOperator, infixSpan);
			
			yield* dedupInfixSubjects(lhs);
			yield* dedupInfixSubjects(rhs);
			
			const lhsIdentifiers = lhs.map(nfxSpan => 
				nfxSpan.boundary.subject.toString());
			
			for (const infixSpan of rhs)
				if (lhsIdentifiers.includes(infixSpan.boundary.subject.toString()))
					yield new X.Fault(X.Faults.InfixHasSelfReferentialType, infixSpan);
			
			if (infix.isPopulation)
				for (let idx = 1; idx < lhs.length; idx++)
					yield new X.Fault(X.Faults.InfixPopulationChaining, lhs[idx]);
			
			yield* expedientListCheck(lhs);
			yield* expedientListCheck(rhs);
		}
		
		for (const infixSpan of dedupInfixesAcrossInfixes(
			patternSpan,
			infix => patternSpan.eachDeclarationForInfix(infix)))
		{
			if (infixSpan.containingInfix.isPopulation)
				yield new X.Fault(
					X.Faults.PopulationInfixHasMultipleDefinitions,
					infixSpan);
		}
		
		for (const infixSpan of dedupInfixesAcrossInfixes(
			patternSpan,
			infix => patternSpan.eachAnnotationForInfix(infix)))
		{
			if (infixSpan.containingInfix.isPortability)
				yield new X.Fault(
					X.Faults.PortabilityInfixHasMultipleDefinitions, 
					infixSpan);
		}
		
		this._infixSpans = Object.freeze(infixSpans);
	}
	
	/**
	 * Gets whether the joint operator exists at the
	 * end of the statement, forcing the statement's
	 * declarations to be "refresh types".
	 */
	get isRefresh()
	{
		const f = X.LineFlags.isRefresh;
		return (this.flags & f) === f;
	}
	
	/**
	 * Gets whether the statement contains nothing
	 * other than a single joint operator.
	 */
	get isVacuous()
	{
		const f = X.LineFlags.isVacuous;
		return (this.flags & f) === f;
	}
	
	/**
	 * Gets whether the statement is a comment.
	 */
	get isComment()
	{
		const f = X.LineFlags.isComment;
		return (this.flags & f) === f;
	}
	
	/**
	 * Gets whether the statement contains
	 * no non-whitespace characters.
	 */
	get isWhitespace()
	{
		const f = X.LineFlags.isWhitespace;
		return (this.flags & f) === f;
	}
	
	/**
	 * Gets whether the statement is a comment or whitespace.
	 */
	get isNoop()
	{
		return this.isComment || this.isWhitespace;
	}
	
	/**
	 * Gets whether the statement has been
	 * removed from it's containing document.
	 */
	get isDisposed()
	{
		const f = X.LineFlags.isDisposed;
		return (this.flags & f) === f;
	}
	
	/**
	 * 
	 */
	get isCruft()
	{
		const f = X.LineFlags.isCruft;
		return (this.flags & f) === f;
	}
	
	/** @internal */
	private flags = X.LineFlags.none;
	
	/** */
	readonly faults: ReadonlyArray<X.Fault>;
	
	/** Stores a reference to the document that contains this statement. */
	readonly document: X.Document;
	
	/** Stores the indent level of the statement. */
	readonly indent: number;
	
	/**
	 * Stores the set of objects that are contained by this Statement, 
	 * and are marked as cruft. Note that the only Statement object
	 * that may be located in this set is this Statement object itself.
	 */
	readonly cruftObjects: ReadonlySet<X.Statement | X.Span | X.InfixSpan>;
	
	/**
	 * Gets the line number of this statement in it's containing
	 * document, or -1 if the statement is disposed and/or is not
	 * in the document.
	 */
	get index()
	{
		if (this.isDisposed)
			return -1;
		
		return this.document instanceof X.Document ?
			this.document.getLineNumber(this) :
			-1;
	}
	
	/**
	 * Gets an array of spans in that represent the declarations
	 * of this statement, excluding those that have been marked
	 * as object-level cruft.
	 */
	get declarations()
	{
		if (this.cruftObjects.size === 0)
			return this.allDeclarations;
		
		const out: X.Span[] = [];
		
		for (const span of this.allDeclarations)
			if (!this.cruftObjects.has(span))
				out.push(span);
		
		return Object.freeze(out);
	}
	
	/**
	 * Stores the array of spans that represent the declarations
	 * of this statement, including those that have been marked
	 * as object-level cruft.
	 */
	readonly allDeclarations: ReadonlyArray<X.Span>;
	
	/**
	 * Gets a list of all infixes defined in the pattern of this statement.
	 */
	get infixSpans()
	{
		return this._infixSpans;
	}
	private _infixSpans: ReadonlyArray<X.InfixSpan> = Object.freeze([]);
	
	/**
	 * Gets an array of spans in that represent the annotations
	 * of this statement, from left to right, excluding those that
	 * have been marked as object-level cruft.
	 */
	get annotations()
	{
		if (this.cruftObjects.size === 0)
			return this.allAnnotations;
		
		const out: X.Span[] = [];
		
		for (const span of this.allAnnotations)
			if (!this.cruftObjects.has(span))
				out.push(span);
		
		return Object.freeze(out);
	}
	
	/**
	 * Stores the array of spans that represent the annotations
	 * of this statement, including those that have been marked
	 * as object-level cruft.
	 */
	readonly allAnnotations: ReadonlyArray<X.Span>;
	
	/**
	 * Gets an array of spans in that represent both the declarations
	 * and the annotations of this statement, excluding those that have
	 * been marked as object-level cruft.
	 */
	get spans()
	{
		return this.isCruft ?
			[] :
			this.declarations.concat(this.annotations);
	}
	
	/**
	 * 
	 */
	get allSpans()
	{
		return this.declarations.concat(this.annotations);
	}
	
	/**
	 * Stores the position at which the joint operator exists
	 * in the statement. A negative number indicates that
	 * the joint operator does not exist in the statement.
	 */
	readonly jointPosition: number;
	
	/**
	 * Stores the unprocessed text content of the statement, 
	 * as it appears in the document.
	 */
	readonly sourceText: string;
	
	/**
	 * Stores the statement's textual *sum*, which is the
	 * raw text of the statement's annotations, with whitespace
	 * trimmed. The sum is suitable as an input to a total
	 * pattern.
	 */
	readonly sum: string;
	
	/**
	 * Gets a boolean value indicating whether or not the
	 * statement contains a declaration of a pattern.
	 */
	get hasPattern()
	{
		const d = this.allDeclarations;
		return d.length === 1 && d[0].boundary.subject instanceof X.Pattern;
	}
	
	/**
	 * @internal
	 * Marks the statement as being removed from it's containing document.
	 */
	dispose()
	{
		this.flags = this.flags | X.LineFlags.isDisposed;
	}
	
	/**
	 * @returns The kind of StatementRegion that exists
	 * at the given character offset within the Statement.
	 */
	getRegion(offset: number)
	{
		if (this.isComment || offset < this.indent || this.isCruft)
			return StatementRegion.void;
		
		if (this.isWhitespace)
			return StatementRegion.whitespace;
		
		if (this.hasPattern)
		{
			const bnd = this.allDeclarations[0].boundary;
			if (offset >= bnd.offsetStart && offset <= bnd.offsetEnd)
				return StatementRegion.pattern;
		}
		
		if (offset <= this.jointPosition)
		{
			for (const span of this.allDeclarations)
			{
				const bnd = span.boundary;
				if (offset >= bnd.offsetStart && offset <= bnd.offsetEnd)
					return StatementRegion.declaration;
			}
			
			return StatementRegion.declarationVoid;
		}
		else
		{
			for (const span of this.annotations)
			{
				const bnd = span.boundary;
				if (offset >= bnd.offsetStart && offset <= bnd.offsetEnd)
					return StatementRegion.annotation;
			}
			
			return StatementRegion.annotationVoid;
		}
	}
	
	/**
	 * 
	 */
	getSubject(offset: number)
	{
		return this.getDeclaration(offset) || this.getAnnotation(offset);
	}
	
	/**
	 * @returns A span to the declaration subject at the 
	 * specified offset, or null if there is none was found.
	 */
	getDeclaration(offset: number)
	{
		for (const span of this.declarations)
		{
			const bnd = span.boundary;
			if (offset >= bnd.offsetStart && offset <= bnd.offsetEnd)
				return span;
		}
		
		return null;
	}
	
	/**
	 * @returns A span to the annotation subject at the 
	 * specified offset, or null if there is none was found.
	 */
	getAnnotation(offset: number)
	{
		for (const span of this.annotations)
		{
			const bnd = span.boundary;
			if (offset >= bnd.offsetStart && offset <= bnd.offsetEnd)
				return span;
		}
		
		return null;
	}
	
	/**
	 * @returns A string containing the inner comment text of
	 * this statement, excluding the comment syntax token.
	 * If the statement isn't a comment, null is returned.
	 */
	getCommentText()
	{
		return this.isComment ?
			this.sourceText.slice(this.indent + X.Syntax.comment.length).trim() :
			null;
	}
	
	/**
	 * Converts the statement to a formatted string representation.
	 */
	toString(includeIndent = false)
	{
		const serializeSpans = (
			spans: ReadonlyArray<X.Span>,
			escStyle: X.IdentifierEscapeKind) =>
		{
			return spans
				.filter(sp => !(sp.boundary.subject instanceof X.Anon))
				.map(sp => X.SubjectSerializer.invoke(sp.boundary.subject, escStyle))
				.join(X.Syntax.combinator + X.Syntax.space);
		}
		
		const indent = includeIndent ? X.Syntax.tab.repeat(this.indent) : "";
		
		if (this.isCruft)
			return indent + "(cruft)";
		
		if (this.isWhitespace)
			return indent;
		
		if (this.isVacuous)
			return indent + X.Syntax.joint;
		
		const decls = serializeSpans(this.allDeclarations, X.IdentifierEscapeKind.declaration);
		const annos = serializeSpans(this.allAnnotations, X.IdentifierEscapeKind.annotation);
		
		const joint = annos.length > 0 || this.isRefresh ? X.Syntax.joint : "";
		const jointL = decls.length > 0 && joint !== "" ? X.Syntax.space : "";
		const jointR = annos.length > 0 ? X.Syntax.space : "";
		
		return indent + decls + jointL + joint + jointR + annos;
	}
}


/**
 * Defines the areas of a statement that are significantly
 * different when performing inspection.
 */
export enum StatementRegion
{
	/**
	 * Refers to the area within a comment statement,
	 * or the whitespace preceeding a non-no-op.
	 */
	void,
	
	/**
	 * Refers to the area in the indentation area.
	 */
	whitespace,
	
	/**
	 * Refers to the 
	 */
	pattern,
	
	/** */
	declaration,
	
	/** */
	annotation,
	
	/** */
	declarationVoid,
	
	/** */
	annotationVoid
}


/**
 * Yields faults on infix spans in the case when an identifier
 * has been re-declared multiple times within the same infix.
 */
function *dedupInfixSubjects(side: X.InfixSpan[])
{
	if (side.length === 0)
		return;
	
	const subjects: string[] = [];
	
	for (const nfxSpan of side)
	{
		const subText = nfxSpan.boundary.subject.toString();
		if (subjects.includes(subText))
		{
			yield new X.Fault(X.Faults.InfixHasDuplicateIdentifier, nfxSpan);
		}
		else subjects.push(subText);
	}
}


/**
 * Yields faults on infix spans in the case when an identifier
 * has been re-declared multiple times across the infixes.
 */
function *dedupInfixesAcrossInfixes(
	span: X.Span,
	infixFn: (nfx: X.Infix) => IterableIterator<X.InfixSpan>)
{
	const identifiers: string[] = [];
		
	for (const infix of span.infixes)
	{
		const infixSpans = Array.from(infixFn(infix));
		
		for (const infixSpan of infixSpans)
		{
			const text = infixSpan.boundary.subject.toString();
			if (identifiers.includes(text))
			{
				yield infixSpan;
			}
			else identifiers.push(text);
		}
	}
}


/**
 * Yields when successive equivalent instances are discovered
 * in the specified iterator.
 */
function *dedup<T>(
	iterator: IterableIterator<T>,
	equalityFn: (a: T, b: T) => boolean)
{
	const yielded: T[] = [];
	
	for (const item of iterator)
	{
		if (yielded.includes(item))
			yield item;
		else
			yielded.push(item);
	}
}


/**
 * Performs a quick and dirty check to see if the infix is referencing
 * a list, by looking to see if it has the list operator. A full check needs
 * to perform type inspection to see if any of the types that correspond
 * to the identifiers specified are actually lists.
 */
function *expedientListCheck(side: X.InfixSpan[])
{
	if (side.length === 0)
		return;
	
	for (const nfxSpan of side)
		if (nfxSpan.boundary.subject.isList)
			yield new X.Fault(X.Faults.InfixUsingListOperator, nfxSpan);
}
