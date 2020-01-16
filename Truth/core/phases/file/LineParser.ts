
namespace Truth
{
	/**
	 * Stores the options for the line parser.
	 */
	export interface ILineParserOptions
	{
		/**
		 * Specifies a full URI that the parsing can use to resolve
		 * relative URIs discovered during the parsing process.
		 */
		readonly assumedUri: KnownUri;
		
		/**
		 * A boolean value that indicates whether patterns should be
		 * parsed as patterns (true), or as regular types (false).
		 */
		readonly readPatterns: boolean;
		
		/**
		 * A boolean value that indicates whether URIs should be
		 * parsed as URIs (true), or as regular types (false).
		 */
		readonly readUris: boolean;
	}
	
	/**
	 * Parses a single line of Truth code, and returns
	 * a Line object that contains information about
	 * what was read.
	 */
	export class LineParser
	{
		/**
		 * Generator function that yields all statements (unparsed lines)
		 * of the given source text. 
		 */
		static *read(sourceText: string)
		{
			if (sourceText.length === 0)
				return;
			
			let cursor = 0;
			let statementStart = 0;
			
			for (; cursor < sourceText.length; cursor++)
			{
				if (sourceText[cursor] === Syntax.terminal)
				{
					yield sourceText.slice(statementStart, cursor);
					statementStart = cursor + 1;
				}
			}
			
			if (statementStart < cursor)
				yield sourceText.slice(statementStart);
		}
		
		/**
		 * Main entry point for parsing a single line and producing a
		 * RawStatement object.
		 * 
		 * The parsing algorithm is some kind of quasi-recusive descent with
		 * lookheads and backtracking in some places to make the logic easier
		 * to follow. Technically, it's probably some mash-up of LL(k) & LALR.
		 * Maybe if I blew 4 years of my life in some silly Comp Sci program
		 * instead of dropping out of high school I could say for sure.
		 * 
		 * @param lineText A string containing the line to parse.
		 */
		static parse(lineText: string, options: ILineParserOptions)
		{
			const parser = new Parser(lineText);
			const sourceText = lineText;
			const indent = parser.readWhitespace();
			const declarationEntries: Boundary<Subject>[] = [];
			const annotationEntries: Boundary<Term>[] = [];
			const esc = Syntax.escapeChar;
			let flags = LineFlags.none;
			let jointPosition = -1;
			let sum = "";
			
			/**
			 * Universal function for quickly producing a RawStatement
			 * instance using the values of the constructed local variables.
			 */
			const ret = (fault: StatementFaultType | null = null) => new Line(
				sourceText,
				indent,
				new BoundaryGroup(declarationEntries),
				new BoundaryGroup(annotationEntries),
				sum,
				jointPosition,
				flags,
				fault);
			
			// In the case when the line contains only whitespace characters,
			// this condition will pass, bypassing the entire parsing process
			// and returning an (basically) fresh RawStatement object.
			if (!parser.more())
			{
				flags |= LineFlags.isWhitespace;
				return ret();
			}
			
			{
				const mark = parser.position;
				
				if (parser.read(Syntax.comment))
				{
					if (!parser.more() || parser.read(Syntax.space) || parser.read(Syntax.tab))
					{
						flags |= LineFlags.isComment;
						return ret();
					}
					
					parser.position = mark;
				}
			}
			
			{
				const unparsableFaultType = (() =>
				{
					if (parser.read(Syntax.combinator))
						return Faults.StatementBeginsWithComma;
					
					if (parser.read(Syntax.list))
						return Faults.StatementBeginsWithEllipsis;
					
					if (parser.read(esc + Syntax.space) || parser.read(esc + Syntax.tab))
						return Faults.StatementBeginsWithEscapedSpace;
					
					if (parser.readThenTerminal(esc))
						return Faults.StatementContainsOnlyEscapeCharacter;
					
					return null;
				})();
				
				if (unparsableFaultType)
				{
					flags |= LineFlags.isCruft;
					return ret(unparsableFaultType);
				}
			}
			
			{
				const markBeforeUri = parser.position;
				const uri = maybeReadUri();
				if (uri)
				{
					flags |= LineFlags.hasUri;
					declarationEntries.push(new Boundary(
						markBeforeUri,
						parser.position,
						uri));
					
					return then();
				}
				
				const markBeforePattern = parser.position;
				const pattern = maybeReadPattern();
				
				if (isFault(pattern))
				{
					flags |= LineFlags.isCruft;
					return ret(pattern);
				}
				
				if (pattern)
				{
					flags |= LineFlags.hasPattern;
					flags |= pattern.isTotal ?
						LineFlags.hasTotalPattern :
						LineFlags.hasPartialPattern;
					
					declarationEntries.push(new Boundary(
						markBeforePattern,
						parser.position,
						pattern));
					
					return then();
				}
				
				for (const boundsEntry of readDeclarations([]))
					declarationEntries.push(boundsEntry);
				
				return then();
			}
			
			function then()
			{
				jointPosition = maybeReadJoint();
				
				const readResult = readAnnotations([]);
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
							Term.void));
						
						if (aLen === 0)
							flags |= LineFlags.isVacuous;
					}
					else if (aLen === 0)
					{
						flags |= LineFlags.isRefresh;
					}
				}
				
				return ret();
			}
			
			/**
			 * Reads the following series of declarations, which may be
			 * either directly contained by a statement, or inside an infix.
			 */
			function readDeclarations(quitTokens: string[])
			{
				const entries: Boundary<Term>[] = [];
				const until = quitTokens.concat(Syntax.joint);
				
				while (parser.more())
				{
					const readResult = maybeReadTerm(until);
					
					if (readResult !== null)
						entries.push(new Boundary<Term>(
							readResult.at, 
							parser.position,
							readResult.term));
					
					// The following combinator must be eaten before
					// moving on to another declaration. If this fails,
					// it's because the parse stream has ended.
					if (!parser.read(Syntax.combinator))
						break;
					
					if (peekJoint())
						break;
				}
				
				return entries;
			}
			
			/**
			 * Attempts to read the joint token from the parse stream.
			 * Consumes all surrounding whitespace.
			 * @returns A boolean value indicating whether the joint
			 * token was read.
			 */
			function maybeReadJoint()
			{
				const markBeforeWs = parser.position;
				parser.readWhitespace();
				const markAfterWs = parser.position;
				let foundJointPosition = -1;
				
				if (parser.read(Syntax.joint + Syntax.space) ||
					parser.read(Syntax.joint + Syntax.tab) ||
					parser.readThenTerminal(Syntax.joint))
				{
					foundJointPosition = markAfterWs;
					parser.readWhitespace();
				}
				else
				{
					parser.position = markBeforeWs;
				}
				
				return foundJointPosition;
			}
			
			/**
			 * @returns A boolean value that indicates whether the joint
			 * is the next logical token to be consumed. True is returned
			 * in the case when whitespace characters sit between the
			 * cursor and the joint operator.
			 */
			function peekJoint()
			{
				const innerPeekJoint = () =>
				{
					return parser.peek(Syntax.joint + Syntax.space) ||
						parser.peek(Syntax.joint + Syntax.tab) ||
						parser.peekThenTerminal(Syntax.joint);
				};
				
				if (innerPeekJoint())
					return true;
				
				if (!parser.peek(Syntax.space) && !parser.peek(Syntax.tab))
					return false;
				
				const mark = parser.position;
				parser.readWhitespace();
				const atJoint = innerPeekJoint();
				parser.position = mark;
				
				return atJoint;
			}
			
			/**
			 * 
			 */
			function readAnnotations(quitTokens: string[])
			{
				const annotations: Boundary<Term>[] = [];
				let raw = "";
				
				while (parser.more())
				{
					const readResult = maybeReadTerm(quitTokens);
					
					if (readResult !== null)
					{
						annotations.push(new Boundary(
							readResult.at, 
							parser.position,
							readResult.term));
						
						raw += readResult.raw;
					}
					
					// If the next token is not a combinator, 
					// the parse stream has ended.
					if (!parser.read(Syntax.combinator))
						break;
				}
				
				return {
					annotations,
					raw
				};
			}
			
			/**
			 * Attempts to read and return a term from the parse stream.
			 */
			function maybeReadTerm(quitTokens: string[])
			{
				const until = quitTokens
					.concat(Syntax.combinator)
					.filter(tok => tok !== Syntax.joint);
				
				const shouldQuitOnJoint = quitTokens.includes(Syntax.joint);
				const at = parser.position + parser.readWhitespace();
				let token = "";
				
				while (parser.more())
				{
					if (until.some(tok => parser.peek(tok)))
						break;
					
					if (shouldQuitOnJoint && peekJoint())
						break;
					
					const g1 = parser.readGrapheme();
					
					if (parser.more())
					{
						// The only operators that can be meaningfully escaped at
						// the term level are the joint, the combinator, and the
						// pattern delimiter. Other occurences of the escape character
						// append this character to the term.
						
						if (g1 === esc)
						{
							const g2 = parser.readGrapheme();
							token += g2;
							continue;
						}
					}
					
					token += g1;
				}
				
				const tokenTrimmed = token.trim();
				if (!tokenTrimmed.length)
					return null;
				
				return {
					at,
					term: Term.from(tokenTrimmed),
					raw: token
				};
			}
			
			/**
			 * Attempts to read a URI starting at the current position
			 * of the cursor. The position of the cursor is not changed
			 * in the case when a valid URI was not read.
			 */
			function maybeReadUri()
			{
				if (!options.readUris)
					return null;
				
				let prefix = 
					parser.read(Syntax.httpPrefix) ||
					parser.read(Syntax.httpsPrefix) ||
					parser.read(Syntax.retractingUriPrefix) ||
					parser.read(Syntax.relativeUriPrefix);
				
				if (prefix === "")
					return null;
				
				const mark = parser.position;
				const maybeUriContent = parser.readUntil();
				
				if (maybeUriContent.endsWith(Syntax.truthExtension))
					return KnownUri.fromString(prefix + maybeUriContent, options.assumedUri);
				
				parser.position = mark;
				return null;
			}
			
			/**
			 * Attempts to read a pattern from the steam.
			 */
			function maybeReadPattern(nested = false): Pattern | StatementFaultType | null
			{
				if (!nested && !parser.read(RegexSyntaxDelimiter.main))
					return null;
				
				if (!options.readPatterns)
					return null;
				
				// These are reserved starting sequences. They're invalid
				// regex syntax, and we may use them in the future to pack
				// in other language features.
				if (parser.peek(RegexSyntaxMisc.plus) ||
					parser.peek(RegexSyntaxMisc.star) ||
					parser.peek(RegexSyntaxMisc.restrained))
					return Faults.StatementBeginsWithInvalidSequence;
				
				// TypeScript isn't perfect.
				const units = nested ?
					readRegexUnits(true) :
					readRegexUnits(false);
				
				if (isFault(units))
					return units;
				
				// Right-trim any trailing whitespace
				while (units.length)
				{
					const last = units[units.length - 1];
					
					if (!(last instanceof RegexGrapheme))
						break;
					
					if (last.grapheme !== Syntax.space && last.grapheme !== Syntax.tab)
						break;
					
					units.pop();
				}
				
				if (units.length === 0)
					return Faults.EmptyPattern;
				
				const last = units[units.length - 1];
				const isTotal = 
					last instanceof RegexGrapheme &&
					last.quantifier === null &&
					last.grapheme === RegexSyntaxDelimiter.main;
				
				// Need to pop off the 
				if (isTotal)
					units.pop();
				
				// Now read the annotations, in order to compute the Pattern's hash
				const mark = parser.position;
				const foundJointPosition = maybeReadJoint();
				if (foundJointPosition < 0)
					return new Pattern(Object.freeze(units), isTotal, "");
				
				const annos = readAnnotations([]).annotations;
				const annosArrayJoined = Array.from(annos.values())
					.map(v => v.subject.toString())
					.join(Syntax.terminal);
				
				const hash = Hash.calculate(annosArrayJoined);
				parser.position = mark;
				
				return new Pattern(Object.freeze(units), isTotal, hash);
			}
			
			/**
			 * 
			 */
			function readRegexUnits(nested: true): StatementFaultType | (RegexUnit)[];
			function readRegexUnits(nested: false): StatementFaultType | (RegexUnit | Infix)[];
			function readRegexUnits(nested: boolean): StatementFaultType | (RegexUnit | Infix)[]
			{
				const units: (RegexUnit | Infix)[] = [];
				
				while (parser.more())
				{
					const setOrGroup = maybeReadRegexSet() || maybeReadRegexGroup();
					
					if (isFault(setOrGroup))
						return setOrGroup;
					
					if (setOrGroup !== null)
					{
						const quantifier = maybeReadRegexQuantifier();
						if (isFault(quantifier))
							return quantifier;
						
						units.push(appendQuantifier(setOrGroup, quantifier));
						continue;
					}
					
					if (nested)
					{
						if (parser.peek(RegexSyntaxDelimiter.alternator))
							break;
						
						if (parser.peek(RegexSyntaxDelimiter.groupEnd))
							break;
					}
					else
					{
						// Infixes are not supported anywhere other 
						// than at the top level of the pattern.
						const infix = maybeReadInfix();
						if (isFault(infix))
							return infix;
						
						if (infix !== null)
						{
							const quantifier = maybeReadRegexQuantifier();
							if (quantifier !== null)
								return Faults.InfixHasQuantifier;
							
							units.push(infix);
							continue;
						}
						
						if (peekJoint())
							break;
					}
					
					const grapheme = maybeReadRegexGrapheme();
					if (!grapheme)
						break;
					
					// If the grapheme read is in the RegexSyntaxKnownSet
					// enumeration, we need to convert the grapheme to a
					// RegexSet instance, and push that on to the units array
					// instead.
					
					const regexKnownSet = (() =>
					{
						if (grapheme.character === RegexSyntaxKnownSet.wild && !grapheme.escaped)
							return RegexSyntaxKnownSet.wild;
						
						if (grapheme.escaped)
						{
							const characterWithEscape = esc + grapheme.character;
							const knownSet = RegexSyntaxKnownSet.resolve(characterWithEscape);
							
							if (knownSet !== null)
								return knownSet;
						}
						
						return null;
					})();
					
					const quantifier = maybeReadRegexQuantifier();
					
					if (isFault(quantifier))
						return quantifier;
					
					if (regexKnownSet !== null)
					{
						units.push(new RegexSet([regexKnownSet], [], [], [], false, quantifier));
						continue;
					}
					
					if (grapheme.unicodeBlockName)
					{
						const ubn = grapheme.unicodeBlockName;
						units.push(new RegexSet([], [], [ubn], [], false, quantifier));
						continue;
					}
					
					if (grapheme.escaped)
					{
						const sign = RegexSyntaxSign.resolve(esc + grapheme.character);
						if (sign !== null)
						{
							units.push(new RegexSign(sign, quantifier));
							continue;
						}
						
						// If this point is reached, it's because there was a unneccesarily
						// escaped character found in the parse stream, such as "\a". In
						// this case, the raw character can just be added as a regex unit.
					}
					
					units.push(new RegexGrapheme(
						grapheme.character,
						quantifier));
				}
				
				return units;
			}
			
			/**
			 * Attempts to read a character set from the parse stream.
			 * Example: [a-z0-9]
			 */
			function maybeReadRegexSet(): RegexSet | StatementFaultType | null
			{
				if (!parser.read(RegexSyntaxDelimiter.setStart))
					return null;
				
				const rng = RegexSyntaxDelimiter.range;
				const knowns: RegexSyntaxKnownSet[] = [];
				const ranges: RegexCharRange[] = [];
				const blocks: string[] = [];
				const singles: string[] = [];
				const isNegated = !!parser.read(RegexSyntaxMisc.negate);
				
				let closed = false;
				
				/**
				 * Stores all Graphemes read.
				 */
				const graphemes: (Grapheme | null)[] = [];
				
				/**
				 * Stores booleans that align with the items in "queue",
				 * that indicate whether or not the queued Grapheme
				 * can participate in a range.
				 */
				const rangableQueue: boolean[] = [];
				
				for (;;)
				{
					const g = maybeReadRegexGrapheme();
					
					if (g === null)
						break;
					
					if (!g.escaped && g.character === RegexSyntaxDelimiter.setEnd)
					{
						closed = true;
						break;
					}
					
					if (g.unicodeBlockName)
					{
						blocks.push(g.unicodeBlockName);
						rangableQueue.push(false);
						graphemes.push(null);
						continue;
					}
					
					const gFull = g.escaped ? esc + g.character : g.character;
					const known = RegexSyntaxKnownSet.resolve(gFull);
					
					if (known !== null)
					{
						knowns.push(known);
						rangableQueue.push(false);
						graphemes.push(null);
						continue;
					}
					
					graphemes.push(g);
					
					rangableQueue.push(
						g.character.length > 0 &&
						g.character !== RegexSyntaxMisc.boundary &&
						g.character !== RegexSyntaxMisc.boundaryNon);
					
					if (g.unicodeBlockName)
						continue;
					
					const len = graphemes.length;
					
					if (len < 3)
						continue;
					
					const maybeRng = graphemes[len - 2];
					
					if (maybeRng !== null && maybeRng.character !== rng)
						continue;
					
					if (!rangableQueue[len - 3])
						continue;
					
					const maybeFrom = graphemes[len - 3];
					if (maybeFrom === null)
						throw Exception.unknownState();
						
					// Peel back symbol queue, and add a range
					// to the alphabet builder if the queue gets into
					// a state where it's ending with something
					// looking like: ?-?
					
					const from = maybeFrom.character.codePointAt(0) || 0;
					const to = g.character.codePointAt(0) || 0;
					ranges.push(new RegexCharRange(from, to));
					graphemes.length -= 3;
					continue;
				}
				
				if (!closed)
					return Faults.UnterminatedCharacterSet;
				
				for (const g of graphemes)
					if (g !== null)
						singles.push(g.character);
				
				const quantifier = maybeReadRegexQuantifier();
				if (isFault(quantifier))
					return quantifier;
				
				return new RegexSet(
					knowns,
					ranges,
					blocks,
					singles,
					isNegated,
					quantifier);
			}
			
			/**
			 * Attempts to read an alternation group from the parse stream.
			 * Example: (A|B|C)
			 */
			function maybeReadRegexGroup(): RegexGroup | StatementFaultType | null
			{
				if (!parser.read(RegexSyntaxDelimiter.groupStart))
					return null;
				
				const cases: (readonly RegexUnit[])[] = [];
				let closed = false;
				
				while (parser.more())
				{
					if (parser.read(RegexSyntaxDelimiter.alternator))
						continue;
					
					if (parser.read(RegexSyntaxDelimiter.groupEnd))
					{
						closed = true;
						break;
					}
					
					const subUnits = readRegexUnits(true);
					if (isFault(subUnits))
						return subUnits;
					
					// If the call to maybeReadPattern causes the cursor
					// to reach the end of te parse stream, the expression
					// is invalid because it would mean the input looks
					// something like: /(aa|bb
					if (!parser.more())
						return Faults.UnterminatedGroup;
					
					// A null subPattern could come back in the case when some
					// bizarre syntax is found in the pattern such as: (a||b)
					if (subUnits === null)
						continue;
					
					cases.push(Object.freeze(subUnits));
				}
				
				if (!closed)
					return Faults.UnterminatedGroup;
				
				const quantifier = maybeReadRegexQuantifier();
				if (isFault(quantifier))
					return quantifier;
				
				return new RegexGroup(Object.freeze(cases), quantifier);
			}
			
			/**
			 * Attempts to read a pattern quantifier from the parse stream.
			 * Checks for duplicates, which is necessary because the JavaScript
			 * regular expression flavor (and others?) cannot parse an expression
			 * with two consecutive quantifiers.
			 */
			function maybeReadRegexQuantifier(): RegexQuantifier | StatementFaultType | null
			{
				/** */
				function maybeReadQuantifier()
				{
					const mark = parser.position;
					
					if (parser.read(RegexSyntaxMisc.star))
						return new RegexQuantifier(0, Infinity, isRestrained());
					
					if (parser.read(RegexSyntaxMisc.plus))
						return new RegexQuantifier(1, Infinity, isRestrained());
					
					if (parser.read(RegexSyntaxMisc.restrained))
						return new RegexQuantifier(0, 1, false);
					
					if (!parser.read(RegexSyntaxDelimiter.quantifierStart))
						return null;
					
					const min = maybeReadInteger();
					if (min !== null)
					{
						const quantEnd = RegexSyntaxDelimiter.quantifierEnd;
						
						// {2}
						if (parser.read(quantEnd))
							return new RegexQuantifier(min, min, isRestrained());
						
						// {2,} or {2,3} or {2,???
						if (parser.read(RegexSyntaxDelimiter.quantifierSeparator))
						{
							if (parser.read(quantEnd))
								return new RegexQuantifier(min, Infinity, isRestrained());
							
							const max = maybeReadInteger();
							if (max !== null && parser.read(quantEnd))
								return new RegexQuantifier(min, max, isRestrained());
						}
					}
					
					parser.position = mark;
					return null;
				}
				
				/** */
				function isRestrained()
				{
					return !!parser.read(RegexSyntaxMisc.restrained);
				}
				
				const quantifier = maybeReadQuantifier();
				if (quantifier)
					if (maybeReadQuantifier())
						return Faults.DuplicateQuantifier;
				
				return quantifier;
			}
			
			/**
			 * 
			 */
			function maybeReadInteger()
			{
				let integerText = "";
				
				for (let i = 0; i < 16 && parser.more(); i++)
				{
					const digit = (() =>
					{
						for (let digit = 0; digit <= 9; digit++)
							if (parser.read(digit.toString()))
								return digit.toString();
						
						return "";
					})();
					
					if (!digit)
						break;
					
					integerText += digit;
				}
				
				return integerText.length > 0 ?
					parseInt(integerText, 10) :
					null;
			}
			
			/**
			 * 
			 */
			function maybeReadInfix(): Infix | StatementFaultType | null
			{
				const mark = parser.position;
				const lhsEntries: Boundary<Term>[] = [];
				const rhsEntries: Boundary<Term>[] = [];
				const infixStart = parser.position;
				let infixFlags: InfixFlags = InfixFlags.none;
				let quitToken = InfixSyntax.end;
				let hasJoint = false;
				
				if (parser.read(InfixSyntax.nominalStart))
				{
					infixFlags |= InfixFlags.nominal;
					quitToken = InfixSyntax.nominalEnd;
				}
				else if (parser.read(InfixSyntax.patternStart))
				{
					infixFlags |= InfixFlags.pattern;
					quitToken = InfixSyntax.patternEnd;
				}
				else if (parser.read(InfixSyntax.start))
				{
					infixFlags |= InfixFlags.population;
					quitToken = InfixSyntax.end;
				}
				else return null;
				
				parser.readWhitespace();
				
				if (parser.read(Syntax.joint))
				{
					infixFlags |= InfixFlags.portability;
					parser.readWhitespace();
					
					for (const boundsEntry of readAnnotations([quitToken]).annotations)
						rhsEntries.push(new Boundary(
							boundsEntry.offsetStart,
							parser.position,
							boundsEntry.subject));
				}
				else
				{
					for (const boundsEntry of readDeclarations([quitToken]))
						lhsEntries.push(boundsEntry);
					
					parser.readWhitespace();
					
					if (maybeReadJoint() > -1)
					{
						hasJoint = true;
						parser.readWhitespace();
						
						for (const boundsEntry of readAnnotations([quitToken]).annotations)
							rhsEntries.push(new Boundary(
								boundsEntry.offsetStart,
								parser.position,
								boundsEntry.subject));
					}
				}
				
				// Avoid producing an infix in weird cases such as:
				// < : >  </  />  <<:>>
				if (lhsEntries.length + rhsEntries.length === 0)
				{
					parser.position = mark;
					return null;
				}
				
				if (hasJoint)
					infixFlags |= InfixFlags.hasJoint;
				
				parser.readWhitespace();
				
				if (!parser.read(quitToken))
					return Faults.UnterminatedInfix;
				
				return new Infix(
					infixStart,
					parser.position,
					new BoundaryGroup(lhsEntries),
					new BoundaryGroup(rhsEntries),
					infixFlags);
			}
			
			/**
			 * Attempts to read one single symbol from the parse stream,
			 * while respecting unicode escape sequences, and escaped
			 * characters.
			 * 
			 * @returns The read string, or an empty string in the case when
			 * there are no more characters in the parse stream.
			 */
			function maybeReadRegexGrapheme(): Grapheme | null
			{
				if (!parser.more())
					return null;
				
				const mark = parser.position;
				
				if (parser.read(RegexSyntaxDelimiter.utf16GroupStart))
				{
					const delim = RegexSyntaxDelimiter.utf16GroupEnd;
					const unicodeRef = parser.readUntil(delim);
					
					// Make sure the readUntil method stopped because it
					// actually hit the delimiter, and not because it ran out
					// of characters.
					if (parser.more())
					{
						parser.read(delim);
						
						if (UnicodeBlocks.has(unicodeRef.toLowerCase()))
							return new Grapheme("", unicodeRef, true);
						
						const len = unicodeRef.length;
						if (len >= 1 && len <= 5)
						{
							const num = parseInt(unicodeRef, 16);
							if (num === num)
							{
								const char = String.fromCodePoint(num);
								return new Grapheme(char, "", true);
							}
						}
					}
					
					// Something came in that looked like a unicode escape
					// sequence, but turned out not to be, like: \u
					parser.position = mark;
				}
				
				if (parser.read(esc))
				{
					// If the parse stream ends with a backslash, we just
					// return the actual backslash character as a character.
					// This covers ridiculous but possible cases where a
					// an unannotated type is named something like "Thing\".
					if (!parser.more())
						return new Grapheme(esc, "", false);
					
					const g = parser.readGrapheme();
					const decoded = RegexSyntaxSign.unescape(esc + g) || g;
					return new Grapheme(decoded, "", true);
				}
				
				return new Grapheme(parser.readGrapheme(), "", false);
			}
			
			/** */
			function isFault(value: unknown): value is StatementFaultType
			{
				return value instanceof FaultType;
			}
		}
		
		/** */
		private constructor() { }
	}
	
	/** */
	class Grapheme
	{
		constructor(
			/**
			 * Stores the character found in the parse stream in
			 * their unescaped format. For example, in the case
			 * when the field is referring to a unicode character,
			 * the field would store "🐇" ... not "\u1F407".
			 */
			readonly character: string,
			/**
			 * Stores the name of the unicode block specified,
			 * or an empty string if the grapheme does not refer
			 * to a unicode block.
			 */
			readonly unicodeBlockName: string,
			/**
			 * Stores whether the discovered grapheme was
			 * escaped in the parse stream. Note that if the
			 * grapheme refers to a special character, such
			 * as "\d" for all digits, this will be true.
			 */
			readonly escaped: boolean)
		{ }
	}
	
	/**
	 * Slightly awkward hack function to attach a PatternQuantifier
	 * to an already existing PatternUnit (without resorting to making
	 * quantifier a mutable property.
	 */
	function appendQuantifier(unit: RegexUnit, quantifier: RegexQuantifier | null = null)
	{
		if (quantifier === null)
			return unit;
		
		if (unit instanceof RegexSet)
			return new RegexSet(
				unit.knowns,
				unit.ranges,
				unit.unicodeBlocks,
				unit.singles,
				unit.isNegated,
				quantifier);
		
		if (unit instanceof RegexGroup)
			return new RegexGroup(unit.cases, quantifier);
		
		if (unit instanceof RegexGrapheme)
			return new RegexGrapheme(unit.grapheme, quantifier);
		
		throw Exception.notImplemented();
	}
}
