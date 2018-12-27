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
		emit: "\\/"
	},
	"A, /, B : C, /, D": {
		emit: "A, /, B : C, /, D",
		annotations: ["C", "/", "D"],
		joint: 8
	},
	"/, A, B": {
		unparsable: true
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
	
	// Pattern Parsing
	
	"/[A-Z]/ : X": {
		annotations: "X",
		total: true,
		match: "B"
	},
	"/[A-Z\d]/ : X": {
		annotations: "X",
		total: true,
		match: "5"
	},
	
	// Pattern Quantifiers
	
	"/\d+ : X": {
		annotations: "X",
		partial: true,
		match: "1234"
	},
	"/x\d* : X": {
		annotations: "X",
		partial: true,
		match: ["x", "x1", "x2"]
	},
	"/x\d{0} : X": {
		annotations: "X",
		partial: true,
		match: "x",
		noMatch: "x4"
	},
	"/\d{2,} : X": {
		annotations: "X",
		partial: true,
		match: "123",
		noMatch: "12"
	},
	"/\d{3,6} : X": {
		annotations: "X",
		partial: true,
		match: "12345"
	},
	
	// Non Pattern Quantifiers
	
	"/\d{,3} : X": {
		annotations: "X",
		partial: true,
		match: "2{,3}",
		noMatch: "123"
	},
	"/\d{x,} : X": {
		annotations: "X",
		partial: true,
		match: "2{x,}"
	}
};
