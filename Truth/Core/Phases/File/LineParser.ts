import * as X from "../../X";


/**
 * Local marker values used as return values to
 * indicate that a pattern failed to parse.
 */
const ParseError = Symbol();
type TParseError = typeof ParseError;


/**
 * 
 */
export class LineParser
{
	/**
	 * Generator function that yields all statements
	 * (unparsed lines) of the given source text. 
	 */
	static *read(fullSource: string)
	{
		let cursor = -1;
		let statementStart = 0;
		const char = () => fullSource[cursor];
		
		for (;;)
		{
			if (cursor >= fullSource.length - 1)
				yield fullSource.slice(statementStart);
			
			cursor++;
			
			if (char() === X.Syntax.terminal)
			{
				yield fullSource.slice(statementStart, cursor);
				statementStart = cursor + 1;
			}
		}
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
	 */
	static parse(lineText: string)
	{
		const parser = new X.Parser(lineText);
		const sourceText = lineText;
		const indent = parser.readWhitespace();
		const declarations = new Map<number, X.Identifier | X.Uri | X.Pattern | null>();
		const annotations = new Map<number, X.Identifier | null>();
		const esc = X.Syntax.escapeChar;
		let flags = X.LineFlags.none;
		let jointPosition = -1;
		
		/**
		 * Universal function for quickly producing a RawStatement
		 * instance using the values of the constructed local variables.
		 */
		const ret = () => new X.Line(
			sourceText,
			indent,
			declarations,
			annotations,
			flags,
			jointPosition);
		
		/**
		 * Can this be called from the context of an Infix?
		 */
		function readDeclarations(quitTokens: string[])
		{
			const declarations = new Map<number, X.Identifier>();
			
			while (parser.more())
			{
				const mark = parser.position;
				const rawDeclaration = maybeReadDeclaration(quitTokens);
				const trimmed = rawDeclaration.trim();
				
				if (trimmed.length > 0)
					declarations.set(mark, new X.Identifier(rawDeclaration));
				
				// If the next token is not a combinator, the either
				// the parse stream has ended, or is at the joint.
				if (!parser.peek(X.Syntax.combinator))
					break;
			}
			
			return declarations;
		}
		
		/**
		 * Reads a declaration from the parse stream, which may
		 * be contained directly by the statement, or by an infix.
		 */
		function maybeReadDeclaration(quitTokens: string[])
		{
			let token = "";
			
			while (parser.more())
			{
				if (quitTokens.some(token => parser.peek(token)))
					break;
				
				const g = maybeReadFullGrapheme();
				
				if (g === null)
					break;
				
				if (!g.escaped)
				{
					if (g.character === X.Syntax.combinator)
						break;
					
					if (g.character === X.Syntax.joint)
						break;
				}
				
				token += g.character;
			}
			
			return token;
		}
		
		/**
		 * Attempts to read the joint token from the parse stream.
		 * Consumes all surrounding whitespace.
		 * @returns A boolean value indicating whether the joint
		 * token was read.
		 */
		function maybeReadJoint()
		{
			parser.readWhitespace();
			const mark = parser.position;
			
			if (parser.read(X.Syntax.joint + X.Syntax.space) ||
				parser.read(X.Syntax.joint + X.Syntax.tab) ||
				parser.readThenTerminal(X.Syntax.joint))
				jointPosition = mark;
			
			parser.readWhitespace();
			return jointPosition > -1;
		}
		
		/**
		 * 
		 */
		function readAnnotations(quitTokens: string[])
		{
			const annotations = new Map<number, X.Identifier>();
			let rawAnnotationsText = "";
			
			while (parser.more())
			{
				const mark = parser.position;
				const rawAnnotation = maybeReadAnnotation(quitTokens);
				const trimmed = rawAnnotation.trim();
				
				if (trimmed.length > 0)
					annotations.set(mark, new X.Identifier(rawAnnotation));
				
				rawAnnotationsText += rawAnnotation;
				
				// If the next token is not a combinator, 
				// the parse stream has ended.
				if (!parser.peek(X.Syntax.combinator))
					break;
			}
			
			return {
				annotations,
				rawAnnotationsText
			}
		}
		
		/**
		 * Attempts to read a raw annotation from the parse stream.
		 * If found, the raw string found is returned.
		 */
		function maybeReadAnnotation(quitTokens: string[])
		{
			let token = "";
			
			do
			{
				if (quitTokens.some(token => parser.peek(token)))
					break;
				
				if (parser.peek(X.Syntax.combinator))
					break;
				
				const g = maybeReadFullGrapheme();
				
				if (g === null)
					break;
				
				token += g.character;
			}
			while (parser.more() && !parser.peek(X.Syntax.combinator));
			
			return token;
		}
		
		/**
		 * Attempts to read a URI starting at the current position
		 * of the cursor. The position of the cursor is not changed
		 * in the case when a URI was not read.
		 */
		function maybeReadUri()
		{
			const mark = parser.position;
			let uri: X.Uri | null = null;
			
			for (const protocol of X.Uri.eachProtocol())
			{
				const prefix = protocol + "//";
				if (!parser.peek(prefix))
					continue;
				
				uri = X.Uri.parse(parser.readUntil(" ", "\t"));
				break;
			}
			
			if (uri === null)
				parser.position = mark;
			
			return uri;
		}
		
		/**
		 * Can be called recursively via readPatternClass and readPatternGroup.
		 */
		function maybeReadPattern(nested = false): X.Pattern | TParseError | null
		{
			if (!nested && !parser.read(X.RegexSyntaxDelimiter.main))
				return null;
			
			// TypeScript isn't perfect.
			const units = nested ?
				readRegexUnits(true) :
				readRegexUnits(false);
			
			if (units === ParseError)
				return ParseError;
			
			// Right-trim any trailing whitespace
			while (units.length)
			{
				const last = units[units.length - 1];
				
				if (!(last instanceof X.RegexGrapheme))
					break;
				
				if (last.grapheme !== X.Syntax.space && last.grapheme !== X.Syntax.tab)
					break;
				
				units.pop();
			}
			
			if (units.length === 0)
				return ParseError;
			
			const last = units[units.length - 1];
			const isTotal = 
				last instanceof X.RegexGrapheme &&
				last.quantifier === null &&
				last.grapheme === X.RegexSyntaxDelimiter.main;
			
			// Now read the annotations, in order to compute the Pattern's CRC
			const mark = parser.position;
			maybeReadJoint();
			
			const annos = readAnnotations([]).annotations;
			const annosArray = Array.from(annos.values()).sort();
			const crc = X.Crc.calculate(annosArray.join(X.Syntax.terminal));
			parser.position = mark;
			
			return new X.Pattern(Object.freeze(units), isTotal, crc);
		}
		
		/**
		 * 
		 */
		function readRegexUnits(nested: true): TParseError | (X.RegexUnit)[];
		function readRegexUnits(nested: false): TParseError | (X.RegexUnit | X.Infix)[];
		function readRegexUnits(nested: boolean): TParseError | (X.RegexUnit | X.Infix)[]
		{
			const units: (X.RegexUnit | X.Infix)[] = [];
			
			while (parser.more())
			{
				const setOrGroup = maybeReadRegexSet() || maybeReadRegexGroup();
				
				if (setOrGroup === ParseError)
					return ParseError;
				
				if (setOrGroup !== null)
				{
					const quantifier = maybeReadRegexQuantifier();
					if (quantifier === ParseError)
						return ParseError;
					
					units.push(appendQuantifier(setOrGroup, quantifier));
					continue;
				}
				
				if (nested)
				{
					if (parser.peek(X.RegexSyntaxDelimiter.alternator))
						break;
					
					if (parser.peek(X.RegexSyntaxDelimiter.groupEnd))
						break;
				}
				else
				{
					// Infixes are not supported anywhere other 
					// than at the top level of the pattern.
					const infix = maybeReadInfix();
					if (infix === ParseError)
						return ParseError;
					
					if (infix !== null)
					{
						units.push(infix);
						continue;
					}
					
					if (maybeReadJoint())
						break;
				}
				
				const grapheme = maybeReadFullGrapheme();
				if (!grapheme)
					break;
				
				// If the grapheme read is in the RegexSyntaxKnownSet
				// enumeration, we need to convert the grapheme to a
				// RegexSet instance, and push that on to the units array
				// instead.
				
				const regexKnownSet = (() =>
				{
					if (grapheme.character === X.RegexSyntaxKnownSet.wild && !grapheme.escaped)
						return X.RegexSyntaxKnownSet.wild;
					
					if (grapheme.escaped)
					{
						const characterWithEscape = esc + grapheme.character;
						const knownSet = X.RegexSyntaxKnownSet.resolve(characterWithEscape);
						
						if (knownSet !== null)
							return knownSet;
					}
					
					return null;
				})();
				
				const quantifier = maybeReadRegexQuantifier();
				
				if (quantifier === ParseError)
					return ParseError;
				
				if (regexKnownSet !== null)
				{
					units.push(new X.RegexSet(
						[regexKnownSet], 
						[],
						[],
						false,
						quantifier));
					
					continue;
				}
				
				if (grapheme.escaped)
				{
					const sign = X.RegexSyntaxSign.resolve(esc + grapheme.character);
					if (sign !== null)
					{
						units.push(new X.RegexSign(sign, quantifier));
						continue;
					}
				}
				
				units.push(new X.RegexGrapheme(
					grapheme.character,
					quantifier));
			}
			
			return units;
		}
		
		/**
		 * Attempts to read a character set from the parse stream.
		 * Example: [a-z0-9]
		 */
		function maybeReadRegexSet(): X.RegexSet | TParseError | null
		{
			if (!parser.read(X.RegexSyntaxDelimiter.setStart))
				return null;
			
			const rng = X.RegexSyntaxDelimiter.range;
			const knowns: X.RegexSyntaxKnownSet[] = [];
			const ranges: X.RegexCharRange[] = [];
			const singles: string[] = [];
			const isNegated = !!parser.read(X.RegexSyntaxMisc.negate);
			
			let closed = false;
			
			/** Stores all Graphemes read. */
			const queue: Grapheme[] = [];
			
			/**
			 * Stores booleans that align with the items in "queue",
			 * that indicate whether or not the queued Grapheme
			 * can participate in a range.
			 */
			const rangableQueue: boolean[] = [];
			
			for (;;)
			{
				const g = maybeReadFullGrapheme();
				
				if (g === null)
					break;
				
				if (!g.escaped && g.character === X.RegexSyntaxDelimiter.setEnd)
				{
					closed = true;
					break;
				}
				
				queue.push(g);
				const known = X.RegexSyntaxKnownSet.resolve(g.character);
				
				if (known !== null)
				{
					knowns.push(known);
					rangableQueue.push(false);
					continue;
				}
				
				const regexSign = X.RegexSyntaxSign.resolve(g.character);
				if (regexSign !== null)
				{
					
				}
				
				rangableQueue.push(
					g.character.length > 0 &&
					g.character !== X.RegexSyntaxMisc.boundary &&
					g.character !== X.RegexSyntaxMisc.boundaryNon);
				
				if (g.unicodeBlockName)
					continue;
				
				const len = queue.length;
				
				if (len > 2)
					continue;
				
				if (queue[len - 2].character !== rng)
					continue;
				
				if (!rangableQueue[len - 3])
					continue;
				
				
				// Peel back symbol queue, and add a range
				// to the alphabet builder if the queue gets into
				// a state where it's ending with something
				// looking like: ?-?
				
				const from = queue[len - 2].character.codePointAt(0) || 0;
				const to = g.character.codePointAt(0) || 0;
				ranges.push(new X.RegexCharRange(from, to));
				queue.length -= 3;
				continue;
			}
			
			if (!closed)
				return ParseError;
			
			for (const g of queue)
			{
				if (g.unicodeBlockName)
				{
					const [from, to] = X.UnicodeBlocks[g.unicodeBlockName];
					ranges.push(new X.RegexCharRange(from, to));
				}
				else
				{
					singles.push(g.character);
				}
			}
			
			const quantifier = maybeReadRegexQuantifier();
			if (quantifier === ParseError)
				return ParseError;
			
			return new X.RegexSet(
				knowns,
				ranges,
				singles,
				isNegated,
				quantifier);
		}
		
		/**
		 * Attempts to read an alternation group from the parse stream.
		 * Example: (A|B|C)
		 */
		function maybeReadRegexGroup(): X.RegexGroup | TParseError | null
		{
			if (!parser.read(X.RegexSyntaxDelimiter.groupStart))
				return null;
			
			const cases: ReadonlyArray<X.RegexUnit>[] = [];
			let closed = false;
			
			while (parser.more())
			{
				if (parser.read(X.RegexSyntaxDelimiter.alternator))
					continue;
				
				if (parser.read(X.RegexSyntaxDelimiter.groupEnd))
				{
					closed = true;
					break;
				}
				
				const subUnits = readRegexUnits(true);
				if (subUnits === ParseError)
					return ParseError;
				
				// If the call to maybeReadPattern causes the cursor
				// to reach the end of te parse stream, the expression
				// is invalid because it would mean the input looks
				// something like: /(aa|bb
				if (!parser.more())
					return ParseError;
				
				// A null subPattern could come back in the case when some
				// bizarre syntax is found in the pattern such as: (a||b)
				if (subUnits === null)
					continue;
				
				cases.push(Object.freeze(subUnits));
			}
			
			if (!closed)
				return ParseError;
			
			const quantifier = maybeReadRegexQuantifier();
			if (quantifier === ParseError)
				return ParseError;
			
			return new X.RegexGroup(Object.freeze(cases), quantifier);
		}
		
		/**
		 * Attempts to read a pattern quantifier from the parse stream.
		 * Checks for duplicates, which is necessary because the JavaScript
		 * regular expression flavor (and others?) cannot parse an expression
		 * with two consecutive quantifiers.
		 */
		function maybeReadRegexQuantifier(): X.RegexQuantifier | TParseError | null
		{
			/** */
			function maybeReadQuantifier()
			{
				if (parser.read(X.RegexSyntaxMisc.star))
					return new X.RegexQuantifier(0, Infinity, isRestrained());
				
				if (parser.read(X.RegexSyntaxMisc.plus))
					return new X.RegexQuantifier(1, Infinity, isRestrained());
				
				if (!parser.read(X.RegexSyntaxDelimiter.quantifierStart))
					return null;
				
				const mark = parser.position;
				const sep = X.RegexSyntaxDelimiter.quantifierSeparator;
				const lowerBound = maybeReadInteger();
				let upperBound = lowerBound;
				
				const shouldRewind = (() =>
				{
					if (lowerBound === null)
						return false;
					
					if (parser.read(X.RegexSyntaxDelimiter.quantifierEnd))
						return false;
					
					if (!parser.read(sep))
						return false;
					
					if (parser.read(X.RegexSyntaxDelimiter.quantifierEnd))
					{
						upperBound = Infinity;
						return false;
					}
					
					upperBound = maybeReadInteger();
					
					if (upperBound === null)
						return true;
					
					return false;
				})();
				
				if (shouldRewind || lowerBound === null || upperBound === null)
				{
					parser.position = mark;
					return null;
				}
				
				return new X.RegexQuantifier(
					lowerBound,
					upperBound,
					isRestrained());
			}
			
			/** */
			function isRestrained()
			{
				return !!parser.read(X.RegexSyntaxMisc.restrained);
			}
			
			const quantifier = maybeReadQuantifier();
			if (quantifier)
			{
				const subsequentQuantifier = maybeReadQuantifier();
				if (subsequentQuantifier)
					return ParseError;
			}
			
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
				parseInt(integerText) :
				null;
		}
		
		/**
		 * 
		 */
		function maybeReadInfix(): X.Infix | TParseError | null
		{
			const mark = parser.position;
			const lhsSubjects = new Map<number, X.Identifier>();
			const rhsSubjects = new Map<number, X.Identifier>();
			
			let infixFlags: X.InfixFlags = X.InfixFlags.none;
			let quitToken = X.InfixSyntax.end;
			let hasJoint = false;
			
			if (!parser.read(X.InfixSyntax.nominalStart))
			{
				infixFlags |= X.InfixFlags.nominal;
				quitToken = X.InfixSyntax.nominalEnd;
			}
			else if (parser.read(X.InfixSyntax.patternStart))
			{
				infixFlags |= X.InfixFlags.pattern;
				quitToken = X.InfixSyntax.patternEnd;
			}
			else if (parser.read(X.InfixSyntax.start))
			{
				quitToken = X.InfixSyntax.end;
			}
			else return null;
			
			parser.readWhitespace();
			
			if (parser.read(X.Syntax.joint))
			{
				infixFlags |= X.InfixFlags.portability;
				parser.readWhitespace();
				
				for (const [pos, ident] of readAnnotations([quitToken]).annotations)
					rhsSubjects.set(pos, ident);
			}
			else
			{
				for (const [pos, ident] of readDeclarations([quitToken]))
					lhsSubjects.set(pos, ident);
				
				parser.readWhitespace();
				hasJoint = !!parser.read(X.Syntax.joint);
				
				if (hasJoint)
					for (const [pos, ident] of readAnnotations([quitToken]).annotations)
						rhsSubjects.set(pos, ident);
			}
			
			// Avoid producing an infix in weird cases such as:
			// < : >  </  />  <<:>>
			if (lhsSubjects.size + rhsSubjects.size === 0)
			{
				parser.position = mark;
				return null;
			}
			
			if (hasJoint)
				infixFlags |= X.InfixFlags.hasJoint;
			
			return new X.Infix(
				lhsSubjects,
				rhsSubjects,
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
		function maybeReadFullGrapheme(): Grapheme | null
		{
			if (!parser.more())
				return null;
			
			if (parser.read(esc))
			{
				// If the parse stream ends with a backslash, we just
				// return the actual backslash character as a character.
				// This covers ridiculous but possible cases where a
				// an unannotated type is named something like "Thing\".
				if (!parser.more())
					return new Grapheme(esc, "", false);
				
				if (parser.read(X.RegexSyntaxDelimiter.utf16Prefix))
				{
					const mark = parser.position;
					const g3 = parser.readGrapheme();
					
					if (g3 === X.RegexSyntaxDelimiter.utf16GroupStart)
					{
						const delim = X.RegexSyntaxDelimiter.utf16GroupEnd;
						const unicodeLabel = parser.readUntil(delim);
						const cleanEnd = !!parser.read(delim);
						
						if (cleanEnd)
						{
							if (/[a-f0-9]{1,5}/.test(unicodeLabel))
							{
								const num = parseInt(unicodeLabel, 16);
								const char = String.fromCharCode(num);
								return new Grapheme(char, "", true);
							}
							else if (unicodeLabel in X.UnicodeBlocks)
							{
								return new Grapheme("", unicodeLabel, true);
							}
						}
					}
					
					parser.position = mark;
				}
				
				const g = parser.readGrapheme();
				const char = esc + g;
				const sign = X.RegexSyntaxSign.resolve(char);
				
				const decodedChar = sign === null ?
					char :
					decodeURIComponent(char);
				
				return new Grapheme(decodedChar, "", true);
			}
			
			return new Grapheme(parser.readGrapheme(), "", false)
		}
		
		/**
		 * @returns A boolean value that indicates whether the
		 * input content is unparsable (and assigns the appropriate
		 * flag before doing so).
		 */
		function maybeReadUnparsable()
		{
			if (parser.read(X.Syntax.combinator) ||
				parser.read(X.Syntax.list) ||
				parser.read(esc + X.Syntax.space) ||
				parser.read(esc + X.Syntax.tab) ||
				parser.readThenTerminal(esc))
			{
				flags |= X.LineFlags.isUnparsable;
				return true;
			}
			
			return false;
		}
		
		// In the case when the line contains only whitespace characters,
		// this condition will pass, bypassing the entire parsing process
		// and returning an (basically) fresh RawStatement object.
		if (!parser.more())
		{
			flags |= X.LineFlags.isWhitespace;
			return ret();
		}
		
		if (parser.read(X.Syntax.comment))
		{
			flags |= X.LineFlags.isComment;
			return ret();
		}
		
		if (maybeReadUnparsable())
			return ret();
		
		// Edsger Dijkstra considered harmful:
		{
			const markBeforeUri = parser.position;
			const uri = maybeReadUri();
			if (uri)
			{
				flags |= X.LineFlags.hasUri;
				declarations.set(markBeforeUri, uri);
				return goto();
			}
			
			const markBeforePattern = parser.position;
			const pattern = maybeReadPattern();
			
			if (pattern === ParseError)
			{
				flags |= X.LineFlags.isUnparsable;
				return ret();
			}
			
			if (pattern)
			{
				flags |= X.LineFlags.hasPattern;
				flags |= pattern.isTotal ?
					X.LineFlags.hasTotalPattern :
					X.LineFlags.hasPartialPattern;
				
				declarations.set(markBeforePattern, pattern);
				return goto();
			}
			
			for (const [mark, declaration] of readDeclarations([]))
				declarations.set(mark, declaration);
			
			return goto();
			
			function goto()
			{
				maybeReadJoint();
				
				const readAnnotationsResult = readAnnotations([]);
				for (const [offset, annotation] of readAnnotationsResult.annotations)
					annotations.set(offset, annotation);
				
				return ret();
			}
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
	
	/** */
	get code() { return this.character.codePointAt(0); }
}


/**
 * Slightly awkward hack function to attach a PatternQuantifier
 * to an already existing PatternUnit (without resorting to making
 * quantifier a mutable property.
 */
function appendQuantifier(unit: X.RegexUnit, quantifier: X.RegexQuantifier | null = null)
{
	if (quantifier === null)
		return unit;
	
	if (unit instanceof X.RegexSet)
		return new X.RegexSet(unit.knowns, unit.ranges, unit.singles, unit.isNegated, quantifier);
	
	if (unit instanceof X.RegexGroup)
		return new X.RegexGroup(unit.cases, quantifier);
	
	if (unit instanceof X.RegexGrapheme)
		return new X.RegexGrapheme(unit.grapheme, quantifier);
	
	throw X.ExceptionMessage.notImplemented();
}
