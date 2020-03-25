
namespace Truth
{
	/**
	 * Stores the options for the line scanner.
	 */
	export interface IParserOptions
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
	 * @internal
	 * Parses a single line of Truth code, and returns
	 * a Line object that contains information about
	 * what was read.
	 */
	export namespace Parser
	{
		/**
		 * Reads the following series of declarations, which may be
		 * either directly contained by a statement, or inside an infix.
		 */
		export function parseDeclarations(scanner: Scanner, quitTokens: string[])
		{
			const entries: Boundary<Term>[] = [];
			const until = quitTokens.concat(Syntax.joint);
			
			while (scanner.more())
			{
				const parseResult = maybeParseTerm(scanner, until);
				
				if (parseResult !== null)
					entries.push(new Boundary<Term>(
						parseResult.at, 
						scanner.offset,
						parseResult.term));
				
				// The following combinator must be eaten before
				// moving on to another declaration. If this fails,
				// it's because the parse stream has ended.
				if (!scanner.read(Syntax.combinator))
					break;
				
				if (peekJoint(scanner))
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
		export function maybeParseJoint(scanner: Scanner)
		{
			const markBeforeWs = scanner.position;
			scanner.readWhitespace();
			const markAfterWs = scanner.position;
			let foundJointPosition = -1;
			
			if (scanner.read(Syntax.joint + Syntax.space) ||
				scanner.read(Syntax.joint + Syntax.tab) ||
				scanner.readThenTerminal(Syntax.joint))
			{
				foundJointPosition = markAfterWs;
				scanner.readWhitespace();
			}
			else
			{
				scanner.position = markBeforeWs;
			}
			
			return foundJointPosition;
		}
		
		/**
		 * @returns A boolean value that indicates whether the joint
		 * is the next logical token to be consumed. True is returned
		 * in the case when whitespace characters sit between the
		 * cursor and the joint operator.
		 */
		function peekJoint(scanner: Scanner)
		{
			const innerPeekJoint = () =>
			{
				return scanner.peek(Syntax.joint + Syntax.space) ||
					scanner.peek(Syntax.joint + Syntax.tab) ||
					scanner.peekThenTerminal(Syntax.joint);
			};
			
			if (innerPeekJoint())
				return true;
			
			if (!scanner.peek(Syntax.space) && !scanner.peek(Syntax.tab))
				return false;
			
			const mark = scanner.position;
			scanner.readWhitespace();
			const atJoint = innerPeekJoint();
			scanner.position = mark;
			
			return atJoint;
		}
		
		/**
		 * 
		 */
		export function readAnnotations(scanner: Scanner, quitTokens: string[])
		{
			const annotations: Boundary<Term>[] = [];
			let raw = "";
			
			while (scanner.more())
			{
				const readResult = maybeParseTerm(scanner, quitTokens);
				
				if (readResult !== null)
				{
					annotations.push(new Boundary(
						readResult.at, 
						scanner.offset,
						readResult.term));
					
					raw += readResult.raw;
				}
				
				// If the next token is not a combinator, 
				// the parse stream has ended.
				if (!scanner.read(Syntax.combinator))
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
		function maybeParseTerm(scanner: Scanner, quitTokens: string[])
		{
			const until = quitTokens
				.concat(Syntax.combinator)
				.filter(tok => tok !== Syntax.joint);
			
			const shouldQuitOnJoint = quitTokens.includes(Syntax.joint);
			const at = scanner.position + scanner.readWhitespace();
			let token = "";
			
			while (scanner.more())
			{
				if (until.some(tok => scanner.peek(tok)))
					break;
				
				if (shouldQuitOnJoint && peekJoint(scanner))
					break;
				
				const g1 = scanner.readGrapheme();
				
				if (scanner.more())
				{
					// The only operators that can be meaningfully escaped at
					// the term level are the joint, the combinator, and the
					// pattern delimiter. Other occurences of the escape character
					// append this character to the term.
					
					if (g1 === Syntax.escapeChar)
					{
						const g2 = scanner.readGrapheme();
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
		export function maybeParseUri(scanner: Scanner, options: IParserOptions)
		{
			if (!options.readUris)
				return null;
			
			let prefix = 
				scanner.read(Syntax.httpPrefix) ||
				scanner.read(Syntax.httpsPrefix) ||
				scanner.read(Syntax.retractingUriPrefix) ||
				scanner.read(Syntax.relativeUriPrefix);
			
			if (prefix === "")
				return null;
			
			const mark = scanner.position;
			const maybeUriContent = scanner.readUntil();
			
			if (maybeUriContent.endsWith(Extension.truth) ||
				maybeUriContent.endsWith(Extension.script))
				return KnownUri.fromString(prefix + maybeUriContent, options.assumedUri);
			
			scanner.position = mark;
			return null;
		}
		
		/**
		 * Attempts to read a pattern from the steam.
		 */
		export function maybeParsePattern(
			scanner: Scanner,
			options: IParserOptions,
			nested = false): Pattern | StatementFaultType | null
		{
			if (!nested && !scanner.read(RegexSyntaxDelimiter.main))
				return null;
			
			if (!options.readPatterns)
				return null;
			
			// These are reserved starting sequences. They're invalid
			// regex syntax, and we may use them in the future to pack
			// in other language features.
			if (scanner.peek(RegexSyntaxMisc.plus) ||
				scanner.peek(RegexSyntaxMisc.star) ||
				scanner.peek(RegexSyntaxMisc.restrained))
				return Faults.StatementBeginsWithInvalidSequence;
			
			// TypeScript isn't perfect.
			// TODO: Is the "nested" parameter even necessary here?
			const units = nested ?
				readRegexUnits(scanner, true) :
				readRegexUnits(scanner, false);
			
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
			const mark = scanner.position;
			const foundJointPosition = maybeParseJoint(scanner);
			if (foundJointPosition < 0)
				return new Pattern(Object.freeze(units), isTotal, "");
			
			const annos = readAnnotations(scanner, []).annotations;
			const annosArrayJoined = Array.from(annos.values())
				.map(v => v.subject.toString())
				.join(Syntax.terminal);
			
			const hash = Hash.calculate(annosArrayJoined);
			scanner.position = mark;
			
			return new Pattern(Object.freeze(units), isTotal, hash);
		}
		
		/**
		 * 
		 */
		function readRegexUnits(scanner: Scanner, nested: true): StatementFaultType | (RegexUnit)[];
		function readRegexUnits(scanner: Scanner, nested: false): StatementFaultType | (RegexUnit | Infix)[];
		function readRegexUnits(scanner: Scanner, nested: boolean)
		{
			const units: (RegexUnit | Infix)[] = [];
			
			while (scanner.more())
			{
				const setOrGroup = maybeParseRegexSet(scanner) || maybeParseRegexGroup(scanner);
				
				if (isFault(setOrGroup))
					return setOrGroup;
				
				if (setOrGroup !== null)
				{
					const quantifier = maybeParseRegexQuantifier(scanner);
					if (isFault(quantifier))
						return quantifier;
					
					units.push(appendQuantifier(setOrGroup, quantifier));
					continue;
				}
				
				if (nested)
				{
					if (scanner.peek(RegexSyntaxDelimiter.alternator))
						break;
					
					if (scanner.peek(RegexSyntaxDelimiter.groupEnd))
						break;
				}
				else
				{
					// Infixes are not supported anywhere other 
					// than at the top level of the pattern.
					const infix = maybeParseInfix(scanner);
					if (isFault(infix))
						return infix;
					
					if (infix !== null)
					{
						const quantifier = maybeParseRegexQuantifier(scanner);
						if (quantifier !== null)
							return Faults.InfixHasQuantifier;
						
						units.push(infix);
						continue;
					}
					
					if (peekJoint(scanner))
						break;
				}
				
				const grapheme = maybeParseRegexGrapheme(scanner);
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
						const characterWithEscape = Syntax.escapeChar + grapheme.character;
						const knownSet = RegexSyntaxKnownSet.resolve(characterWithEscape);
						
						if (knownSet !== null)
							return knownSet;
					}
					
					return null;
				})();
				
				const quantifier = maybeParseRegexQuantifier(scanner);
				
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
					const sign = RegexSyntaxSign.resolve(Syntax.escapeChar + grapheme.character);
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
		function maybeParseRegexSet(scanner: Scanner): RegexSet | StatementFaultType | null
		{
			if (!scanner.read(RegexSyntaxDelimiter.setStart))
				return null;
			
			const rng = RegexSyntaxDelimiter.range;
			const knowns: RegexSyntaxKnownSet[] = [];
			const ranges: RegexCharRange[] = [];
			const blocks: string[] = [];
			const singles: string[] = [];
			const isNegated = !!scanner.read(RegexSyntaxMisc.negate);
			
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
				const g = maybeParseRegexGrapheme(scanner);
				
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
				
				const gFull = g.escaped ? Syntax.escapeChar + g.character : g.character;
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
			
			const quantifier = maybeParseRegexQuantifier(scanner);
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
		function maybeParseRegexGroup(scanner: Scanner): RegexGroup | StatementFaultType | null
		{
			if (!scanner.read(RegexSyntaxDelimiter.groupStart))
				return null;
			
			const cases: (readonly RegexUnit[])[] = [];
			let closed = false;
			
			while (scanner.more())
			{
				if (scanner.read(RegexSyntaxDelimiter.alternator))
					continue;
				
				if (scanner.read(RegexSyntaxDelimiter.groupEnd))
				{
					closed = true;
					break;
				}
				
				const subUnits = readRegexUnits(scanner, true);
				if (isFault(subUnits))
					return subUnits;
				
				// If the call to maybeParsePattern causes the cursor
				// to reach the end of te parse stream, the expression
				// is invalid because it would mean the input looks
				// something like: /(aa|bb
				if (!scanner.more())
					return Faults.UnterminatedGroup;
				
				// A null subPattern could come back in the case when some
				// bizarre syntax is found in the pattern such as: (a||b)
				if (subUnits === null)
					continue;
				
				cases.push(Object.freeze(subUnits));
			}
			
			if (!closed)
				return Faults.UnterminatedGroup;
			
			const quantifier = maybeParseRegexQuantifier(scanner);
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
		function maybeParseRegexQuantifier(scanner: Scanner): RegexQuantifier | StatementFaultType | null
		{
			/** */
			function isRestrained()
			{
				return !!scanner.read(RegexSyntaxMisc.restrained);
			}
			
			/** */
			function maybeParseQuantifier()
			{
				const mark = scanner.position;
				
				if (scanner.read(RegexSyntaxMisc.star))
					return new RegexQuantifier(0, Infinity, isRestrained());
				
				if (scanner.read(RegexSyntaxMisc.plus))
					return new RegexQuantifier(1, Infinity, isRestrained());
				
				if (scanner.read(RegexSyntaxMisc.restrained))
					return new RegexQuantifier(0, 1, false);
				
				if (!scanner.read(RegexSyntaxDelimiter.quantifierStart))
					return null;
				
				const min = maybeParseInteger(scanner);
				if (min !== null)
				{
					const quantEnd = RegexSyntaxDelimiter.quantifierEnd;
					
					// {2}
					if (scanner.read(quantEnd))
						return new RegexQuantifier(min, min, isRestrained());
					
					// {2,} or {2,3} or {2,???
					if (scanner.read(RegexSyntaxDelimiter.quantifierSeparator))
					{
						if (scanner.read(quantEnd))
							return new RegexQuantifier(min, Infinity, isRestrained());
						
						const max = maybeParseInteger(scanner);
						if (max !== null && scanner.read(quantEnd))
							return new RegexQuantifier(min, max, isRestrained());
					}
				}
				
				scanner.position = mark;
				return null;
			}
			
			const quantifier = maybeParseQuantifier();
			if (quantifier)
				if (maybeParseQuantifier())
					return Faults.DuplicateQuantifier;
			
			return quantifier;
		}
		
		/**
		 * 
		 */
		function maybeParseInteger(scanner: Scanner)
		{
			let integerText = "";
			
			for (let i = 0; i < 16 && scanner.more(); i++)
			{
				const digit = (() =>
				{
					for (let digit = 0; digit <= 9; digit++)
						if (scanner.read(digit.toString()))
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
		function maybeParseInfix(scanner: Scanner): Infix | StatementFaultType | null
		{
			const mark = scanner.position;
			const lhsEntries: Boundary<Term>[] = [];
			const rhsEntries: Boundary<Term>[] = [];
			const infixStart = scanner.position;
			let infixFlags: InfixFlags = InfixFlags.none;
			let quitToken = InfixSyntax.end;
			let hasJoint = false;
			
			if (scanner.read(InfixSyntax.nominalStart))
			{
				infixFlags |= InfixFlags.nominal;
				quitToken = InfixSyntax.nominalEnd;
			}
			else if (scanner.read(InfixSyntax.patternStart))
			{
				infixFlags |= InfixFlags.pattern;
				quitToken = InfixSyntax.patternEnd;
			}
			else if (scanner.read(InfixSyntax.start))
			{
				infixFlags |= InfixFlags.population;
				quitToken = InfixSyntax.end;
			}
			else return null;
			
			scanner.readWhitespace();
			
			if (scanner.read(Syntax.joint))
			{
				infixFlags |= InfixFlags.portability;
				scanner.readWhitespace();
				
				for (const boundsEntry of readAnnotations(scanner, [quitToken]).annotations)
					rhsEntries.push(new Boundary(
						boundsEntry.offsetStart,
						scanner.offset,
						boundsEntry.subject));
			}
			else
			{
				for (const boundsEntry of parseDeclarations(scanner, [quitToken]))
					lhsEntries.push(boundsEntry);
				
				scanner.readWhitespace();
				
				if (maybeParseJoint(scanner) > -1)
				{
					hasJoint = true;
					scanner.readWhitespace();
					
					for (const boundsEntry of readAnnotations(scanner, [quitToken]).annotations)
						rhsEntries.push(new Boundary(
							boundsEntry.offsetStart,
							scanner.offset,
							boundsEntry.subject));
				}
			}
			
			// Avoid producing an infix in weird cases such as:
			// < : >  </  />  <<:>>
			if (lhsEntries.length + rhsEntries.length === 0)
			{
				scanner.position = mark;
				return null;
			}
			
			if (hasJoint)
				infixFlags |= InfixFlags.hasJoint;
			
			scanner.readWhitespace();
			
			if (!scanner.read(quitToken))
				return Faults.UnterminatedInfix;
			
			return new Infix(
				infixStart,
				scanner.offset,
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
		function maybeParseRegexGrapheme(scanner: Scanner): Grapheme | null
		{
			if (!scanner.more())
				return null;
			
			const mark = scanner.position;
			
			if (scanner.read(RegexSyntaxDelimiter.utf16GroupStart))
			{
				const delim = RegexSyntaxDelimiter.utf16GroupEnd;
				const unicodeRef = scanner.readUntil(delim);
				
				// Make sure the readUntil method stopped because it
				// actually hit the delimiter, and not because it ran out
				// of characters.
				if (scanner.more())
				{
					scanner.read(delim);
					
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
				scanner.position = mark;
			}
			
			if (scanner.read(Syntax.escapeChar))
			{
				// If the parse stream ends with a backslash, we just
				// return the actual backslash character as a character.
				// This covers ridiculous but possible cases where a
				// an unannotated type is named something like "Thing\".
				if (!scanner.more())
					return new Grapheme(Syntax.escapeChar, "", false);
				
				const g = scanner.readGrapheme();
				const decoded = RegexSyntaxSign.unescape(Syntax.escapeChar + g) || g;
				return new Grapheme(decoded, "", true);
			}
			
			return new Grapheme(scanner.readGrapheme(), "", false);
		}
		
		/** */
		export function isFault(value: unknown): value is StatementFaultType
		{
			return value instanceof FaultType;
		}
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
