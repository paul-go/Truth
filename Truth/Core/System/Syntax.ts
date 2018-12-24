
/**
 * An enumeration that stores language syntax tokens.
 */
export const enum Syntax
{
	tab = "\t",
	space = " ",
	terminal = "\n",
	combinator = ",",
	joint = ":",
	list = "...",
	escapeChar = "\\",
	comment = "// ",
	truthExtension = "truth",
	agentExtension = "js",
}


/**
 * An enumeration that stores the escape sequences
 * that only match a single kind of character. "Sign" in
 * this case refers to the fact that these are escape
 * sequences that refer to another character.
 */
export enum RegexSyntaxSign
{
	tab = "\\t",
	lineFeed = "\\n",
	carriageReturn = "\\r",
	verticalTab = "\\v",
	formFeed = "\\f",
	escapedFinalizer = "\\/"
}

export namespace RegexSyntaxSign
{
	export function resolve(value: string): RegexSyntaxSign | null
	{
		const vals: string[] = Object.values(RegexSyntaxSign);
		const idx = vals.indexOf(value);
		return idx < 0 ? null : <RegexSyntaxSign>vals[idx];
	}
}


/**
 * An enumeration that stores the escape sequences
 * that can match more than one kind of character.
 */
export enum RegexSyntaxKnownSet
{
	digit = "\\d",
	digitNon = "\\D",
	alphanumeric = "\\w",
	alphanumericNon = "\\W",
	whitespace = "\\s",
	whitespaceNon = "\\S",
	wild = ".",
}

export namespace RegexSyntaxKnownSet
{
	export function resolve(value: string): RegexSyntaxKnownSet | null
	{
		const vals: string[] = Object.values(RegexSyntaxKnownSet);
		const idx = vals.indexOf(value);
		return idx < 0 ? null : <RegexSyntaxKnownSet>vals[idx];
	}
}


/**
 * An enumeration that stores the delimiters available
 * in the system's regular expression flavor.
 */
export const enum RegexSyntaxDelimiter
{
	main = "/",
	utf16Prefix = "\\u",
	utf16GroupStart = "{",
	utf16GroupEnd = "}",
	groupStart = "(",
	groupEnd = ")",
	alternator = "|",
	setStart = "[",
	setEnd = "]",
	quantifierStart = "{",
	quantifierEnd = "}",
	quantifierSeparator = ",",
	range = "-",
}


/**
 * An enumeration that stores miscellaneous regular
 * expression special characters that don't fit into
 * the other enumerations.
 */
export const enum RegexSyntaxMisc
{
	star = "*",
	plus = "+",
	negate = "^",
	restrained = "?",
	boundary = "\\b",
	boundaryNon = "\\B",
}


/**
 * An enumeration that stores the delimiters available
 * in the infix syntax.
 */
export const enum InfixSyntax
{
	start = "<",
	end = ">",
	nominalStart = "<<",
	nominalEnd = ">>",
	patternStart = "</",
	patternEnd = "/>"
}
