
namespace Truth
{
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
		comment = "//",
		
		// Constants used in URI parsing
		retractingUriPrefix = "../",
		relativeUriPrefix = "./",
		httpPrefix = "http://",
		httpsPrefix = "https://"
	}
	
	/**
	 * An enumeration that stores the kinds of extensions
	 * that are understood by the parser.
	 */
	export const enum Extension
	{
		unknown = "",
		truth = ".truth",
		script = ".truth.js"
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
		escapedFinalizer = "\\/",
		backslash = "\\\\"
	}
	
	/** */
	export namespace RegexSyntaxSign
	{
		/**
		 * @returns A RegexSyntaxSign member from the
		 * specified sign literal (ex: "\t") or raw signable
		 * character (ex: "	").
		 */
		export function resolve(value: string): RegexSyntaxSign | null
		{
			if (value.length < 1 || value.length > 2)
				return null;
			
			const vals = Object.values(RegexSyntaxSign) as string[];
			const idx = vals.indexOf(value);
			return idx < 0 ? null : vals[idx] as RegexSyntaxSign;
		}
		
		/** */
		export function unescape(value: string)
		{
			switch (value)
			{
				case RegexSyntaxSign.tab: return String.fromCodePoint(9);
				case RegexSyntaxSign.lineFeed: return String.fromCodePoint(10);
				case RegexSyntaxSign.carriageReturn: return String.fromCodePoint(13);
				case RegexSyntaxSign.escapedFinalizer: return String.fromCodePoint(47);
				case RegexSyntaxSign.backslash: return String.fromCodePoint(92);
			}
			
			return "";
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
	
	/** */
	export namespace RegexSyntaxKnownSet
	{
		const vals = Object.values(RegexSyntaxKnownSet) as string[];
		
		/** */
		export function resolve(value: string): RegexSyntaxKnownSet | null
		{
			const idx = vals.indexOf(value);
			return idx < 0 ? null : vals[idx] as RegexSyntaxKnownSet;
		}
	}
	
	/**
	 * An enumeration that stores the delimiters available
	 * in the system's regular expression flavor.
	 */
	export const enum RegexSyntaxDelimiter
	{
		main = "/",
		utf16GroupStart = "\\u{",
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
}
