
namespace Truth
{
	/**
	 * A class that represents a single line within a Truth document.
	 */
	export class Statement
	{
		/**
		 * @internal
		 * Generator function that yields all statements
		 * (unparsed lines) of the given source text. 
		 */
		static *readFromSource(
			targetDocument: Document,
			sourceText: string)
		{
			const options = createDefaultParseOptions(targetDocument);
			
			if (sourceText.length === 0)
				return;
			
			const end = sourceText.length - 1;
			let statementStart = 0;
			
			for (let cursor = -1;;)
			{
				if (cursor >= end)
				{
					const smtText = sourceText.slice(statementStart);
					yield new Statement(targetDocument, smtText, options);
					return;
				}
				
				cursor++;
				
				if (sourceText[cursor] === Syntax.terminal)
				{
					const smtText = sourceText.slice(statementStart, cursor);
					yield new Statement(targetDocument, smtText, options);
					statementStart = cursor + 1;
				}
			}
		}
		
		/**
		 * @internal
		 */
		static *readFromScript(
			targetDocument: Document,
			sourceObject: SourceObject)
		{
			const options = createDefaultParseOptions(targetDocument);
			
			function *recurse(sourceObject: SourceObject, depth: number):
				IterableIterator<Statement>
			{
				for (const [declaration, rightSide] of Object.entries(sourceObject))
				{
					const methods: SourceObjectMethods[] = [];
					const annotations: string[] = [];
					const containees: [string, unknown][] = [];
					
					for (const value of (Array.isArray(rightSide) ? rightSide : [rightSide]))
					{
						if (typeof value === "string" && value !== "")
							annotations.push(value);
						
						else if (typeof value === "number" && value === value)
							annotations.push(value.toString());
						
						else if (typeof value === "object" && !!value)
						{
							const methodEntries: [string, unknown][] = [];
							
							for (const [key, valueNested] of Object.entries(value))
							{
								if (typeof valueNested === "function")
									methodEntries.push([key, valueNested]);
								else
									containees.push([key, valueNested]);
							}
							
							if (methodEntries.length > 0)
								methods.push(Object.fromEntries(methodEntries));
						}
					}
					
					const statementText = [
						Syntax.tab.repeat(depth),
						declaration
					];
					
					if (annotations.length > 0)
						statementText.push(
							Syntax.space,
							Syntax.joint,
							Syntax.space,
							annotations.join(Syntax.combinator));
					
					yield Statement.new(
						targetDocument,
						statementText.join(""),
						options,
						methods as any);
					
					if (containees.length > 0)
					{
						const srcObj = Object.fromEntries(containees) as SourceObject;
						yield *recurse(srcObj, depth + 1);
					}
				}
			};
			
			yield *recurse(sourceObject, 0);
		}
		
		/**
		 * @internal
		 */
		static *readFromClasses(
			targetDocument: Document,
			classes: readonly Class[])
		{
			const options = createDefaultParseOptions(targetDocument);
			
			const classMap = new Map<string, Class>();
			for (const amb of classes)
				classMap.set(amb.name, amb);
			
			const namesOf = (classes: Class[] | Class | undefined) =>
			{
				if (classes === undefined)
					return "";
				
				if (Array.isArray(classes))
					return classes.map(amb => amb.name).join(Syntax.combinator);
				
				return classes.name;
			}
			
			function *recurse(cls: Class, depth: number):
				IterableIterator<Statement>
			{
				const tci = new cls() as TraitClassInternal;
				const isNames = namesOf(tci.is);
				
				let statementText = [
					Syntax.tab.repeat(depth),
					cls.name
				];
				
				if (isNames.length > 0)
					statementText.push(
						Syntax.space,
						Syntax.joint,
						Syntax.space,
						isNames);
				
				yield Statement.new(
					targetDocument,
					statementText.join(""),
					options,
					tci.traits.length ? tci.traits : null);
				
				// Generate a separate statement if the Trait Class
				// defines a pattern.
				if (tci.pattern)
				{
					const patternStatementText= [
						RegexSyntaxDelimiter.main,
						tci.pattern.source,
						Syntax.space,
						Syntax.joint,
						Syntax.space,
						cls.name
					];
					
					yield Statement.new(
						targetDocument,
						patternStatementText.join(""),
						options,
						null);
				}
				
				if (tci.has)
				{
					if (Array.isArray(tci.has))
						for (const cls of tci.has)
							yield *recurse(cls, depth + 1);
					
					else yield *recurse(tci.has, depth + 1);
				}
			}
			
			for (const cls of classes)
				yield *recurse(cls, 0);
		}
		
		/**
		 * Creates a temporary statement that will not be attached to any document,
		 * and will not report any faults. Intended for testing, do not call from user
		 * code.
		 */
		static newTemporary(statementText: string, options: IParserOptions)
		{
			return new Statement(null, statementText, options);
		}
		
		/**
		 * @internal
		 * Creates a new statement object, using the private constructor.
		 */
		static new(
			document: Document,
			statementText: string,
			options: IParserOptions = createDefaultParseOptions(document),
			traits: readonly Trait[] | null = null)
		{
			return new Statement(document, statementText, options, traits);
		}
		
		/** */
		private constructor(
			document: Document | null,
			statementText: string,
			options: IParserOptions,
			traits: readonly Trait[] | null = null)
		{
			this.traits = traits;
			
			// This is where the parsing of a statement begins.
			// The algorithm used is some kind of quasi-recusive descent with
			// lookheads and backtracking in some places to make the logic easier
			// to follow. Technically, it's probably some mash-up of LL(k) & LALR.
			// Maybe if I blew 4 years of my life in some silly Comp Sci program
			// instead of dropping out of high school I could say for sure.
			
			const scanner = new Scanner(statementText);
			const indent = scanner.readWhitespace();
			const declarationEntries: Boundary<Subject>[] = [];
			const annotationEntries: Boundary<Term>[] = [];
			let flags = StatementFlags.none;
			let jointPosition = -1;
			let sum = "";
			let faultType: StatementFaultType | null = null;
			
			const shouldFinalize = (() =>
			{
				if (!scanner.more())
				{
					flags |= StatementFlags.isWhitespace;
					return false;
				}
				
				const markBegin = scanner.position;
				if (scanner.read(Syntax.comment))
				{
					if (!scanner.more() || scanner.read(Syntax.space) || scanner.read(Syntax.tab))
					{
						flags |= StatementFlags.isComment;
						return false;
					}
					
					scanner.position = markBegin;
				}
				
				const unparsableFaultType = (() =>
				{
					if (scanner.read(Syntax.combinator))
						return Faults.StatementBeginsWithComma;
					
					if (scanner.read(Syntax.list))
						return Faults.StatementBeginsWithEllipsis;
					
					const esc = Syntax.escapeChar;
					
					if (scanner.read(esc + Syntax.space) || scanner.read(esc + Syntax.tab))
						return Faults.StatementBeginsWithEscapedSpace;
					
					if (scanner.readThenTerminal(esc))
						return Faults.StatementContainsOnlyEscapeCharacter;
					
					return null;
				})();
				
				if (unparsableFaultType)
				{
					flags |= StatementFlags.isCruft;
					faultType = unparsableFaultType;
					return false;
				}
				
				const markBeforeUri = scanner.position;
				const uri = Parser.maybeParseUri(scanner, options);
				if (uri)
				{
					flags |= StatementFlags.hasUri;
					declarationEntries.push(new Boundary(
						markBeforeUri,
						scanner.offset,
						uri));
					
					return true;
				}
				
				const markBeforePattern = scanner.position;
				const pattern = Parser.maybeParsePattern(scanner, options);
				
				if (Parser.isFault(pattern))
				{
					flags |= StatementFlags.isCruft;
					faultType = pattern;
					return false;
				}
				
				if (pattern)
				{
					flags |= StatementFlags.hasPattern;
					flags |= pattern.isTotal ?
						StatementFlags.hasTotalPattern :
						StatementFlags.hasPartialPattern;
					
					declarationEntries.push(new Boundary(
						markBeforePattern,
						scanner.offset,
						pattern));
					
					return true;
				}
				
				for (const boundsEntry of Parser.parseDeclarations(scanner, []))
					declarationEntries.push(boundsEntry);
				
				return true;
			})();
			
			if (shouldFinalize)
			{
				jointPosition = Parser.maybeParseJoint(scanner);
				
				const readResult = Parser.readAnnotations(scanner, []);
				sum = readResult.raw.trim();
				
				for (const boundsEntry of readResult.annotations)
					annotationEntries.push(boundsEntry);
				
				if (jointPosition > -1)
				{
					const dLen = declarationEntries.length;
					const aLen = readResult.annotations.length;
					
					if (dLen === 0)
					{
						declarationEntries.unshift(new Boundary(
							jointPosition,
							jointPosition,
							Term.anonymous));
						
						if (aLen === 0)
							flags |= StatementFlags.isVacuous;
					}
				}
			}
			
			// It must be possible to create a statement without a document
			// in order to support tests. This should not occur in the non-test
			// flow of the system.
			this.document = document || (null as any);
			this.sourceText = statementText;
			this.sum = sum;
			this.indent = indent;
			this.flags = flags;
			this.jointOffset = jointPosition;
			
			const allDeclarations: Span[] = this.allDeclarations = [];
			for (const boundary of declarationEntries)
				allDeclarations.push(new Span(this, boundary));
			
			const allAnnotations: Span[] = this.allAnnotations = [];
			for (const boundary of annotationEntries)
				allAnnotations.push(new Span(this, boundary));
			
			const faults: Fault[] = [];
			const cruftObjects = new Set<Statement | Span | InfixSpan>();
			
			if (document)
			{
				if (faultType !== null)
					faults.push(new Fault(faultType, this));
				
				for (const fault of this.eachParseFault())
				{
					if (fault.type.severity === FaultSeverity.error)
						cruftObjects.add(fault.source);
					
					faults.push(fault);
				}
			
				for (const fault of faults)
					// Check needed to support the unit tests, the feed
					// fake document objects into the statement constructor.
					if (document.program && document.program.faults)
						document.program.faults.report(fault);
			}
			
			this.cruftObjects = cruftObjects;
			this.faults = Object.freeze(faults);
		}
		
		/** @internal */
		readonly id = id();
		
		/**
		 * 
		 */
		private *eachParseFault(): IterableIterator<Readonly<Fault<TFaultSource>>>
		{
			// Check for tabs and spaces mixture
			if (this.indent > 0)
			{
				let hasTabs = false;
				let hasSpaces = false;
				
				for (let i = -1; ++i < this.indent;)
				{
					const chr = this.sourceText[i];
					
					if (chr === Syntax.tab)
						hasTabs = true;
					
					if (chr === Syntax.space)
						hasSpaces = true;
				}
				
				if (hasTabs && hasSpaces)
					yield new Fault(Faults.TabsAndSpaces, this);
			}
			
			if (this.allDeclarations.length > 1)
			{
				const subjects: string[] = [];
				
				for (const span of this.allDeclarations)
				{
					const subText = span.toString();
					if (subjects.includes(subText))
						yield new Fault(Faults.DuplicateDeclaration, span);
					else
						subjects.push(subText);
				}
			}
			
			if (this.allAnnotations.length > 0)
			{
				// This performs an expedient check for "ListIntrinsicExtendingList",
				// however, full type checking is required to cover all cases where
				// this fault may be reported.
				const getListSpans = (spans: readonly Span[]) => spans.filter(span =>
				{
					const sub = span.boundary.subject;
					return sub instanceof Term && sub.isList;
				});
				
				const lhsListSpans = getListSpans(this.allDeclarations);
				const rhsListSpans = getListSpans(this.allAnnotations);
				
				if (lhsListSpans.length > 0 && rhsListSpans.length > 0)
					for (const span of rhsListSpans)
						yield new Fault(Faults.ListIntrinsicExtendingList, span);
			}
			
			const pattern = (() =>
			{
				if (this.allDeclarations.length === 0)
					return null;
				
				const hp = StatementFlags.hasPattern;
				if ((this.flags & hp) !== hp)
					return null;
				
				const subject = this.allDeclarations[0].boundary.subject;
				return subject instanceof Pattern ?
					subject :
					null;
			})();
			
			if (pattern === null)
				return;
			
			if (!pattern.isValid)
			{
				yield new Fault(Faults.PatternInvalid, this);
				return;
			}
			
			if (this.allAnnotations.length === 0)
				yield new Fault(Faults.PatternWithoutAnnotation, this);
			
			if (pattern.test(""))
				yield new Fault(Faults.PatternCanMatchEmpty, this);
			
			if (!pattern.isTotal)
				for (const unit of pattern.eachUnit())
					if (unit instanceof RegexGrapheme)
						if (unit.grapheme === Syntax.combinator)
						{
							yield new Fault(Faults.PatternPartialWithCombinator, this);
							break;
						}
			
			const patternSpan = this.allDeclarations[0];
			if (patternSpan.infixes.length === 0)
				return;
			
			const infixSpans: InfixSpan[] = [];
			
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
						yield new Fault(Faults.InfixUsingListOperator, infixSpan);
				
				yield *normalizeInfixSpans(lhs);
				yield *normalizeInfixSpans(rhs);
				
				const lhsSubjects = lhs.map(nfxSpan => 
					nfxSpan.boundary.subject.toString());
				
				for (const infixSpan of rhs)
					if (lhsSubjects.includes(infixSpan.boundary.subject.toString()))
						yield new Fault(Faults.InfixHasSelfReferentialType, infixSpan);
				
				if (infix.isPopulation)
					for (let idx = 1; idx < lhs.length; idx++)
						yield new Fault(Faults.InfixPopulationChaining, lhs[idx]);
				
				yield *expedientListCheck(lhs);
				yield *expedientListCheck(rhs);
			}
			
			for (const infixSpan of eachRepeatedInfix(
				patternSpan,
				infix => patternSpan.eachDeclarationForInfix(infix)))
			{
				if (infixSpan.containingInfix.isPopulation)
					yield new Fault(
						Faults.PopulationInfixHasMultipleDefinitions,
						infixSpan);
			}
			
			for (const infixSpan of eachRepeatedInfix(
				patternSpan,
				infix => patternSpan.eachAnnotationForInfix(infix)))
			{
				if (infixSpan.containingInfix.isPortability)
					yield new Fault(
						Faults.PortabilityInfixHasMultipleDefinitions, 
						infixSpan);
			}
			
			this._infixSpans = Object.freeze(infixSpans);
		}
		
		/**
		 * Gets whether the statement contains nothing
		 * other than a single joint operator.
		 */
		get isVacuous()
		{
			const f = StatementFlags.isVacuous;
			return (this.flags & f) === f;
		}
		
		/**
		 * Gets whether the statement is a comment.
		 */
		get isComment()
		{
			const f = StatementFlags.isComment;
			return (this.flags & f) === f;
		}
		
		/**
		 * Gets whether the statement contains
		 * no non-whitespace characters.
		 */
		get isWhitespace()
		{
			const f = StatementFlags.isWhitespace;
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
		 * Gets whether this Statement has been removed from it's
		 * containing document. Removal occurs after the statement
		 * has been invalidated. Therefore, this property will be false
		 * before the invalidation phase has occured, even if it will be
		 * disposed in the current edit transaction.
		 */
		get isDisposed()
		{
			const f = StatementFlags.isDisposed;
			return (this.flags & f) === f;
		}
		
		/**
		 * Gets whether the Statement has been marked as cruft,
		 * due to a parsing error (and specifically not a type error).
		 */
		get isCruft()
		{
			const f = StatementFlags.isCruft;
			return (this.flags & f) === f;
		}
		
		/**
		 * Gets the URI embedded within the Statement, in the case
		 * when the statement is a URI statement.
		 * 
		 * Gets null in the case when the Statement is not a URI
		 * statement.
		 */
		get uri()
		{
			const f = StatementFlags.hasUri;
			return (this.flags & f) === f ?
				this.declarations[0].boundary.subject as KnownUri :
				null;
		}
		
		/** @internal */
		private flags = StatementFlags.none;
		
		/** Stores a list of the parse-related faults that were detected on this Statement. */
		readonly faults: readonly Fault[];
		
		/** Stores a reference to the document that contains this Statement. */
		readonly document: Document;
		
		/** Stores the indent level of the Statement. */
		readonly indent: number;
		
		/**
		 * Stores the set of objects that are contained by this Statement, 
		 * and are marked as cruft. Note that the only Statement object
		 * that may be located in this set is this Statement object itself.
		 */
		readonly cruftObjects: ReadonlySet<Statement | Span | InfixSpan>;
		
		/**
		 * Gets the line number of this statement in it's containing
		 * document, or -1 if the statement is disposed and/or is not
		 * in the document.
		 */
		get line()
		{
			if (this.isDisposed)
				return -1;
			
			if (!(this.document instanceof Document))
			{
				this.lineVersion = null;
				return -1;
			}
			
			if (!this.lineVersion)
				this.lineVersion = Version.min();
			
			if (this.document.version.after(this.lineVersion))
			{
				this.lineVersion.equalize(this.document.version);
				return this._line = this.document.lineNumberOf(this);
			}
			
			return this._line;
		}
		private _line = -1;
		private lineVersion: Version | null = null;
		
		/**
		 * @internal
		 * Adjusts the line number of this statement by the specified offset.
		 * This is to support an optimization so that faults don't need to be
		 * recalculated for addition and removal of no-op statements.
		 */
		moveBy(offset: number)
		{
			// In the case when the line number is less than 0, this means that
			// this Statement's line number hasn't been calculated yet, and 
			// so there is no need to make any adjustments to it.
			if (this._line > 0)
				this._line += offset;
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
			
			const out: Span[] = [];
			
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
		readonly allDeclarations: readonly Span[];
		
		/**
		 * Gets a list of all infixes defined in the pattern of this statement.
		 */
		get infixSpans()
		{
			return this._infixSpans;
		}
		private _infixSpans: readonly InfixSpan[] = Object.freeze([]);
		
		/**
		 * Gets an array of spans in that represent the annotations
		 * of this statement, from left to right, excluding those that
		 * have been marked as object-level cruft.
		 */
		get annotations()
		{
			if (this.cruftObjects.size === 0)
				return this.allAnnotations;
			
			const out: Span[] = [];
			
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
		readonly allAnnotations: readonly Span[];
		
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
		 * Stores the 0-based character offset at which the joint operator 
		 * exists in the statement. A negative number indicates that the
		 * joint operator does not exist in the statement.
		 */
		readonly jointOffset: number;
		
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
			return d.length === 1 && d[0].boundary.subject instanceof Pattern;
		}
		
		/**
		 * @internal
		 * Stores an array of SourceObjectMethods objects that were defined
		 * as being in correspondence with this statement. In the case when
		 * this Statement was not generated from a scripted document, the
		 * stored value is an empty aray.
		 */
		//readonly methods: readonly SourceObjectMethods[];
		//! DOCUMENT
		readonly traits: readonly Trait[] | null = null;
		
		/**
		 * @internal
		 * Marks the statement as being removed from it's containing document.
		 */
		dispose()
		{
			this.flags = this.flags | StatementFlags.isDisposed;
		}
		
		/**
		 * Returns the kind of StatementZone that exists at the given 
		 * 0-based character offset within the Statement. The provided
		 * offset is capped at the character length of the statement.
		 */
		getZone(offset: number)
		{
			if (this.isWhitespace)
				return StatementZone.whitespace;
			
			if (this.isComment || this.isCruft)
				return StatementZone.void;
			
			if (offset === this.jointOffset)
				return StatementZone.joint;
			
			if (offset >= 0 && offset <this.sourceText.length)
				if (this.sourceText[offset] === Syntax.combinator)
					return offset < this.jointOffset ?
						StatementZone.declarationCombinator :
						StatementZone.annotationCombinator;
			
			if (this.hasPattern)
			{
				const bnd = this.allDeclarations[0].boundary;
				if (offset >= bnd.offsetStart && offset <= bnd.offsetEnd)
					return StatementZone.pattern;
			}
			
			if (offset <= this.jointOffset || this.jointOffset < 0)
			{
				for (const span of this.allDeclarations)
				{
					const bnd = span.boundary;
					if (offset >= bnd.offsetStart && offset <= bnd.offsetEnd)
						return StatementZone.declaration;
				}
				
				return StatementZone.declarationWhitespace;
			}
			
			for (const span of this.allAnnotations)
			{
				const bnd = span.boundary;
				if (offset >= bnd.offsetStart && offset <= bnd.offsetEnd)
					return StatementZone.annotation;
			}
			
			return StatementZone.annotationWhitespace;
		}
		
		/**
		 * 
		 */
		getSubject(offset: number)
		{
			return this.getDeclaration(offset) || this.getAnnotation(offset);
		}
		
		/**
		 * Returns the declaration span nearest to the specified 0-based 
		 * character offset, or null in the case when no declaration could
		 * be found in the vicinity.
		 */
		getDeclaration(offset: number)
		{
			if (this.jointOffset > -1 && offset > this.jointOffset)
				return null;
			
			return this.getDeclarationOrAnnotation(offset, this.declarations);
		}
		
		/**
		 * Returns the annotation span nearest to the specified 0-based 
		 * character offset, or null in the case when no annotation could
		 * be found in the vicinity.
		 */
		getAnnotation(offset: number)
		{
			if (this.jointOffset > -1 && offset < this.jointOffset + 1)
				return null;
			
			return this.getDeclarationOrAnnotation(offset, this.annotations);
		}
		
		/**
		 * Returns the span nearest to the specified 0-based character offset, 
		 * within the array of spans provided, or null in the case when no span
		 * could be found in the vicinity.
		 */
		private getDeclarationOrAnnotation(
			offset: number,
			targetSpans: readonly Span[])
		{
			if (targetSpans.length === 0)
				return null;
			
			if (offset <= targetSpans[0].boundary.offsetStart)
				return targetSpans[0];
			
			const lastSpan = targetSpans[targetSpans.length - 1];
			if (offset >= lastSpan.boundary.offsetEnd)
				return lastSpan;
			
			const len = targetSpans.length;
			for (let i = -1; ++i < len;)
			{
				const spanA = targetSpans[i];
				const bndA = spanA.boundary;
				if (offset >= bndA.offsetStart && offset <= bndA.offsetEnd)
					return spanA;
				
				// offset is past the end of the last declaration span
				const spanB = i < len - 1 ? targetSpans[i + 1] : null;
				if (!spanB)
					return spanA;
				
				// offset is between two declaration spans
				if (offset < spanB.boundary.offsetStart)
				{
					const midText = this.sourceText.slice(
						bndA.offsetEnd + 1,
						spanB.boundary.offsetStart);
					
					const combPos = bndA.offsetStart + midText.indexOf(Syntax.combinator);
					return offset > combPos + 1 ? spanB : spanA;
				}
			}
			
			return null;
		}
		
		/**
		 * Returns the character at the specified column (1-based index).
		 */
		charAt(column: number)
		{
			if (column < 1 || this.sourceText.length === 0)
				return "";
			
			if (column - 2 > this.sourceText.length)
				return "";
			
			return this.sourceText[column - 1];
		}
		
		/**
		 * @returns A string containing the inner comment text of
		 * this statement, excluding the comment syntax token.
		 * If the statement isn't a comment, an empty string is returned.
		 */
		getCommentText()
		{
			return this.isComment ?
				this.sourceText.slice(this.indent + Syntax.comment.length).trim() :
				"";
		}
		
		/**
		 * Converts the statement to a formatted string representation.
		 */
		toString(includeIndent = false)
		{
			const serializeSpans = (
				spans: readonly Span[],
				escStyle: TermEscapeKind) =>
			{
				return spans
					.map(sp => Subject.serializeExternal(sp, escStyle))
					.join(Syntax.combinator + Syntax.space);
			};
			
			const indent = includeIndent ? Syntax.tab.repeat(this.indent) : "";
			
			if (this.isCruft)
				return indent + "(cruft)";
			
			if (this.isWhitespace)
				return indent;
			
			if (this.isVacuous)
				return indent + Syntax.joint;
			
			const decls = serializeSpans(this.allDeclarations, TermEscapeKind.declaration);
			const annos = serializeSpans(this.allAnnotations, TermEscapeKind.annotation);
			
			const joint = annos.length > 0 || this.jointOffset > -1 ? Syntax.joint : "";
			const jointL = decls.length > 0 && joint !== "" ? Syntax.space : "";
			const jointR = annos.length > 0 ? Syntax.space : "";
			
			return indent + decls + jointL + joint + jointR + annos;
		}
	}
	
	/**
	 * Defines the areas of a statement that are significantly
	 * different when performing inspection.
	 */
	export const enum StatementZone
	{
		/**
		 * Refers to the area within a comment statement,
		 * or the whitespace preceeding a non-no-op,
		 * or non-existent area of the statement that is beyond
		 * the end of the line.
		 */
		void,
		
		/**
		 * Refers to the indentation area of a statement.
		 */
		whitespace,
		
		/**
		 * Refers to the area of a statement where a pattern
		 * is located.
		 */
		pattern,
		
		/**
		 * Refers to the area (being a single character) of a statement 
		 * where the joint is located.
		 */
		joint,
		
		/**
		 * Refers to an area in a statement where a declaration is located.
		 */
		declaration,
		
		/**
		 * Refers to an area on the declaration side of a statement where 
		 * a combinator is located.
		 */
		declarationCombinator,
		
		/**
		 * Refers to an area in a statement containing whitespace that
		 * exists between two declarations, or between a declaration
		 * and the joint.
		 */
		declarationWhitespace,
		
		/**
		 * Refers to an area in a statement where an annotation is located.
		 */
		annotation,
		
		/**
		 * Refers to an area on the annotation side of a statement where 
		 * a combinator is located.
		 */
		annotationCombinator,
		
		/**
		 * Refers to an area in a statement containing whitespace that
		 * exists between two annotations, or between a joint and an
		 * annotation.
		 */
		annotationWhitespace
	}
	
	/**
	 * A bit field enumeration used to efficiently store
	 * meta data about a Line (or a Statement) object.
	 */
	export enum StatementFlags
	{
		none = 0,
		isVacuous = 1,
		isComment = 2,
		isWhitespace = 4,
		isDisposed = 8,
		isCruft = 16,
		hasUri = 32,
		hasTotalPattern = 64,
		hasPartialPattern = 128,
		hasPattern = 256
	}
	
	/**
	 * Yields faults on infix spans in the case when a term
	 * exists multiple times within the same infix.
	 */
	function *normalizeInfixSpans(side: InfixSpan[])
	{
		if (side.length === 0)
			return;
		
		const subjects = new Set<Subject>();
		
		for (const nfxSpan of side)
		{
			const sub = nfxSpan.boundary.subject;
			if (subjects.has(sub))
				yield new Fault(Faults.InfixHasDuplicateTerm, nfxSpan);
			
			else
				subjects.add(sub);
		}
	}
	
	/**
	 * Yields faults on infix spans in the case when a term
	 * has been re-declared multiple times across the infixes.
	 * 
	 * Yields infixes that have terms that exist multiple times
	 * within the same statement.
	 */
	function *eachRepeatedInfix(
		span: Span,
		infixFn: (nfx: Infix) => IterableIterator<InfixSpan>)
	{
		const subjects = new Set<Subject>();
		
		for (const infix of span.infixes)
		{
			const infixSpans = Array.from(infixFn(infix));
			
			for (const infixSpan of infixSpans)
			{
				const sub = infixSpan.boundary.subject;
				
				if (subjects.has(sub))
					yield infixSpan;
				
				else
					subjects.add(sub);
			}
		}
	}
	
	/**
	 * Performs a quick and dirty check to see if the infix is referencing
	 * a list, by looking to see if it has the list operator. A full type check needs
	 * to be done in order to determine if any of the Types that correspond
	 * to the terms specified are actually lists.
	 */
	function *expedientListCheck(side: InfixSpan[])
	{
		if (side.length === 0)
			return;
		
		for (const nfxSpan of side)
			if (nfxSpan.boundary.subject.isList)
				yield new Fault(Faults.InfixUsingListOperator, nfxSpan);
	}
	
	/**
	 * 
	 */
	function createDefaultParseOptions(doc: Document): IParserOptions
	{
		return {
			assumedUri: doc.uri,
			readPatterns: true,
			readUris: true
		};
	}
}
