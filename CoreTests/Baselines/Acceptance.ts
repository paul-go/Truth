/**
 * This file acts as an early specification for the Truth parser.
 * Although there is no standardized Truth specification
 * at the time of this writing, this acceptance criteria can
 * act as a guide for other Truth compiler implementations.
 * As Truth is a line-based language, these acceptance
 * entries specify the behavior when one single line is fed
 * to the parser.
 */


export interface IExpectation
{
	/**
	 * Indicates whether or not the statement should be parsable.
	 */
	unparsable?: boolean;
	
	/**
	 * Indicates whether or not the declarations in the statement should
	 * be marked as a "refresh types" (types that are forcibly fresh).
	 */
	refresh?: boolean,
	
	/**
	 * Indicates whether or not the statement should be a comment.
	 */
	comment?: boolean,
	
	/**
	 * Indicates whether or not the statement should be marked as
	 * one containing only whitespace characters.
	 */
	whitespace?: boolean,
	
	/**
	 * Indicates whether or not the statement should be found to
	 * have a URI as it's sole declaration.
	 */
	uri?: string,
	
	/**
	 * Indicates whether or not the statement should be found to
	 * have pattern as it's sole declaration, and which happens to
	 * be a "total pattern".
	 */
	total?: boolean,
	
	/**
	 * Indicates whether or not the statement should be found to
	 * have pattern as it's sole declaration, and which happens to
	 * be a "partial pattern".
	 */
	partial?: boolean,
	
	/**
	 * Indicates the character position within the statement where
	 * the joint operator should be found.
	 */
	joint?: number,
	
	/**
	 * Indicates what should be emitted as text after the statement
	 * has been parsed, and is then converted back to a string.
	 */
	emit?: string,
	
	/**
	 * Indicates the annotation or array of annotations that should
	 * be found on the statement. (An empty array or empty string
	 * indicates that no annotations should be found on the statement).
	 */
	annotations?: string | string[],
	
	/**
	 * Indicates that the statement was found to have a pattern as
	 * it's sole declaration (which may be either a "total" or a "partial"
	 * pattern), and that the specified string or array of strings should
	 * each be matchable by this pattern.
	 */
	match?: string | string[],
	
	/**
	 * Similar to match, but reversed in that the string or strings should
	 * NOT be matchable by the pattern.
	 */
	noMatch?: string | string[]
}


export const Acceptance: { [source: string]: IExpectation; } = {
	"": {
		whitespace: true,
		emit: ""
	},
	"Backslash\\": {
		emit: "Backslash\\"
	},
	"A, B : C, D": {
		emit: "A, B : C, D",
		annotations: ["C", "D"]
	},
	"\A": {
		emit: "A"
	},
	"A:B: C": {
		emit: "A:B : C",
		annotations: "C"
	},
	"Refresh:": {
		refresh: true
	},
	"Refresh : ": {
		refresh: true
	},
	"R, E, F, R, E, S, H :": {
		refresh: true
	},
	
	// Escaping
	
	"A\\: B: C": {
		emit: "A\\: B : C",
		annotations: "C"
	},
	"\ A": {
		emit: "A"
	},
	
	// Strange slash usage
	
	"/": {
		unparsable: true
	},
	"/ :": {
		unparsable: true
	},
	"//": {
		comment: true
	},
	"// ": {
		comment: true
	},
	"// :": {
		comment: true
	},
	"\\/" : {
		emit: "\\/",
		partial: false,
		total: false
	},
	"A, /, B : C, /, D": {
		emit: "A, \\/, B : C, /, D",
		annotations: ["C", "/", "D"],
		joint: 8
	},
	"/, A, B": {
		// Why is this unparsable?
		unparsable: true
	},
	
	// Unicode
	
	"🐇 : Bunny": {
		emit: "🐇 : Bunny"
	},
	"🐇, 🐇 : 🐇, 🐇": {
		emit: "🐇, 🐇 : 🐇, 🐇"
	},
	"Σ, 🐇, ★ : Sigma, Bunny, Star": {
		emit: "Σ, 🐇, ★ : Sigma, Bunny, Star"
	},
	"\u{1F407} : NotBunny": {
		emit: "\u{1F407} : NotBunny"
	},
	
	// Strange colon usage
	
	"A : B\\": {
		emit: "A : B\\",
		annotations: "B\\"
	},
	":::": {
		emit: ":: :",
		joint: 2,
		refresh: true
	},
	"::\\: :": {
		emit: "::: :",
		joint: 5,
		refresh: true
	},
	":: :\\:": {
		emit: ": : ::",
		joint: 1
	},
	
	// Strange comma usage
	
	"X,,,": {
		emit: "X",
		joint: -1
	},
	",": {
		unparsable: true
	},
	", A, B : C, D": {
		unparsable: true
	},
	
	// Pattern Partiality & Totality flags
	
	"/total/ : X": {
		annotations: "X",
		total: true,
		match: "total"
	},
	"/partial : X": {
		annotations: "X",
		partial: true,
		match: "partial"
	},
	"/partial-with-escaped-delimiter\\/ : X": {
		annotations: "X",
		partial: true,
		match: "partial-with-escaped-delimiter/"
	},
	"/partial/with/slashes : X": {
		annotations: "X",
		partial: true,
		match: "partial/with/slashes"
	},
	"\\/non-pattern/ : X": {
		annotations: "X",
		partial: false,
		total: false,
		emit: "\\/non-pattern/ : X"
	},
	
	// Pattern Sets
	
	"/[A-Z]/ : X": {
		annotations: "X",
		total: true,
		match: "B",
		noMatch: ["-", "AA"]
	},
	"/[A-Z\\d]/ : X": {
		annotations: "X",
		total: true,
		match: ["A", "Z", "5"],
		noMatch: ["-", "d"]
	},
	"/[A\\tB] : X": {
		annotations: "X",
		total: false,
		match: ["A", "B"],
		noMatch: ["AtB", "A\\tB", "A	B", "\t"]
	},
	"/[\\t-\\\\]/ : X": {
		annotations: "X",
		total: true,
		match: ["$", "0", "9", ":", "=", "<", ">", "A", "Z", "[", "\\"],
		noMatch: ["\t", String.fromCodePoint(0), "]", "a"]
	},
	"/-[\\t-\\\\]-/ : X": {
		annotations: "X",
		total: true,
		match: ["-\t-", "-$-"]
	},
	
	// Patterns with unicode
	
	"/\\u{1F407}/": {
		total: true,
		match: "🐇",
		noMatch: "\\u{1F407}"
	},
	"/\\uFFFF🐇 : X": {
		partial: true,
		match: "uFFFF🐇",
		noMatch: "\uFFFF🐇"
	},
	"/\\u{FFFF🐇 : X": {
		partial: true,
		match: "u{FFFF🐇",
		noMatch: "\\uFFFF🐇"
	},
	
	// Pattern Quantifiers
	
	"/\\d+ : X": {
		annotations: "X",
		partial: true,
		match: "1234"
	},
	"/x\\d* : X": {
		annotations: "X",
		partial: true,
		match: ["x", "x1", "x2"]
	},
	"/x\\d{0} : X": {
		annotations: "X",
		partial: true,
		match: "x",
		noMatch: "x4"
	},
	"/\\d{3,} : X": {
		annotations: "X",
		partial: true,
		match: ["123", "1234"],
		noMatch: "12"
	},
	"/\\d{3,6} : X": {
		annotations: "X",
		partial: true,
		match: "12345",
		noMatch: ["12", "1234567"]
	},
	
	// Non Pattern Quantifiers
	
	"/\\d{,3} : X": {
		annotations: "X",
		partial: true,
		match: "2{,3}",
		noMatch: "123"
	},
	"/\\d{x,} : X": {
		annotations: "X",
		partial: true,
		match: "2{x,}"
	},
	"/\\d{} : X": {
		annotations: "X",
		partial: true,
		match: "2{}",
	},
	"/\\d{ } : X": {
		annotations: "X",
		partial: true,
		match: "2{ }",
	},
	
	// Pattern Groups
	
	"/(A|B) : X": {
		annotations: "X",
		partial: true,
		match: "A",
		noMatch: "|"
	},
	"/(A||B) : X": {
		annotations: "X",
		partial: true,
		match: "A",
		noMatch: ""
	},
	"/(A|B|C|D) : X": {
		annotations: "X",
		partial: true,
		match: ["A", "B", "C", "D"],
	},
	"/([0-5]|[a-c]|[e-f]) : X": {
		annotations: "X",
		partial: true,
		match: ["0", "a", "e"]
	},
	"/([0-5]*|[a-c]+|[e-f]{2}) : X": {
		annotations: "X",
		partial: true,
		match: ["000", "aaa", "ee"],
		noMatch: ["6", "eee"]
	},
	
	// Pattern Infixes
	
	"/< : Portability> : X": {
		
	},
	"/<Population> : X": {
		
	},
	"/<Population1, Population2> : X": {
		
	}
};
