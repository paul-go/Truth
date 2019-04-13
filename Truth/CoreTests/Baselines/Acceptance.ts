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
	refresh?: boolean;
	
	/**
	 * Indicates whether or not the statement should be a comment.
	 */
	comment?: boolean;
	
	/**
	 * Indicates whether or not the statement should be marked as
	 * one containing only whitespace characters.
	 */
	whitespace?: boolean;
	
	/**
	 * Indicates whether or not the statement should be found to
	 * have a URI as it's sole declaration.
	 */
	uri?: {
		protocol: string;
		stores: string[];
		types: string[];
		file: string;
		retractionCount: number;
		isRelative: boolean;
		ext: string;
	};
	
	/**
	 * Indicates whether or not the statement should be found to
	 * have pattern as it's sole declaration, and which happens to
	 * be a "total pattern".
	 */
	total?: boolean;
	
	/**
	 * Indicates whether or not the statement should be found to
	 * have pattern as it's sole declaration, and which happens to
	 * be a "partial pattern".
	 */
	partial?: boolean;
	
	/**
	 * Indicates the character position within the statement where
	 * the joint operator should be found.
	 */
	joint?: number;
	
	/**
	 * Indicates what should be emitted as text after the statement
	 * has been parsed, and is then converted back to a string.
	 */
	emit?: string;
	
	/**
	 * Indicates the annotation or array of annotations that should
	 * be found on the statement. (An empty array or empty string
	 * indicates that no annotations should be found on the statement).
	 */
	annotations?: string | string[];
	
	/**
	 * Indicates that the statement was found to have a pattern as
	 * it's sole declaration (which may be either a "total" or a "partial"
	 * pattern), and that the specified string or array of strings should
	 * each be matchable by this pattern.
	 */
	match?: string | string[];
	
	/**
	 * Similar to match, but reversed in that the string or strings should
	 * NOT be matchable by the pattern.
	 */
	noMatch?: string | string[];
	
	/**
	 * 
	 */
	infixes?: {
		kind: "Pattern" | "Portability" | "Population" | "Nominal";
		lhs?: string | string[];
		rhs?: string | string[];
	}[];
}


export const Acceptance: { [source: string]: IExpectation } = {
	"": {
		whitespace: true,
		emit: ""
	},
	"Backslash\\": {
		emit: "Backslash\\"
	},
	"A,B: C,D": {
		emit: "A, B : C, D",
		annotations: ["C", "D"]
	},
	"\\A": {
		emit: "A"
	},
	"A:B: C": {
		emit: "A:B : C",
		annotations: "C"
	},
	"Refresh:": {
		refresh: true,
		emit: "Refresh :"
	},
	"Refresh : ": {
		refresh: true,
		emit: "Refresh :"
	},
	"R, E, F, R, E, S, H :": {
		refresh: true
	},
	"TabSpcTabSpc\t \t : \t TabSpc": {
		annotations: "TabSpc",
		emit: "TabSpcTabSpc : TabSpc"
	},
	": Anon1, Anon2": {
		annotations: ["Anon1", "Anon2"],
		emit: ": Anon1, Anon2"
	},
	"\t:\tAnon": {
		annotations: ["Anon"],
		emit: "\t: Anon"
	},
	"\t\t": {
		emit: "\t\t"
	},
	" \t ": {
		emit: "\t\t\t"
	},
	
	//# URIs
	
	"/x.truth": {
		uri: {
			protocol: "file:",
			retractionCount: 0,
			isRelative: false,
			stores: [],
			file: "x.truth",
			ext: ".truth",
			types: []
		}
	},
	"/x.truth.js": {
		uri: {
			protocol: "file:",
			retractionCount: 0,
			isRelative: false,
			stores: [],
			file: "x.truth.js",
			ext: ".truth.js",
			types: []
		}
	},
	"/x.truth.wasm": {
		uri: {
			protocol: "file:",
			retractionCount: 0,
			isRelative: false,
			stores: [],
			file: "x.truth.wasm",
			ext: ".truth.wasm",
			types: []
		}
	},
	"./file-with-unknown-extension.txt": {
		uri: undefined
	},
	"./path/file.truth": {
		uri: {
			protocol: "?",
			retractionCount: 0,
			isRelative: true,
			stores: ["path"],
			file: "file.truth",
			ext: ".truth",
			types: []
		}	
	},
	"../../path/file.truth": {
		uri: {
			protocol: "?",
			retractionCount: 2,
			isRelative: true,
			stores: ["path"],
			file: "file.truth",
			ext: ".truth",
			types: []
		}
	},
	"http://path/to/file.truth": {
		uri: {
			protocol: "http:",
			retractionCount: 0,
			isRelative: false,
			stores: ["path", "to"],
			file: "file.truth",
			ext: ".truth",
			types: []
		}
	},
	"http://127.0.0.1:8000/file.truth": {
		uri: {
			protocol: "http:",
			retractionCount: 0,
			isRelative: false,
			stores: ["127.0.0.1:8000"],
			file: "file.truth",
			ext: ".truth",
			types: []
		}
	},
	"http://127.0.0.1:800099/file.truth": {
		uri: undefined
	},
	"http://127.0.0.1:8000XYZ/file.truth": {
		uri: undefined
	},
	"/absolute/file.truth": {
		uri: {
			protocol: "file:",
			retractionCount: 0,
			isRelative: false,
			stores: ["absolute"],
			file: "file.truth",
			ext: ".truth",
			types: []
		}
	},
	"//protocol/relative/file.truth": {
		uri: {
			protocol: "?",
			retractionCount: 0,
			isRelative: false,
			stores: ["protocol", "relative"],
			file: "file.truth",
			ext: ".truth",
			types: []
		}
	},
	"/Users/x.truth//type/path/type": {
		uri: {
			protocol: "file:",
			retractionCount: 0,
			isRelative: false,
			stores: ["Users"],
			file: "x.truth",
			ext: ".truth",
			types: ["type", "path", "type"]
		}
	},
	"/Users/x.truth//type/%2Fpattern%20here/type": {
		uri: {
			protocol: "file:",
			retractionCount: 0,
			isRelative: false,
			stores: ["Users"],
			file: "x.truth",
			ext: ".truth",
			types: ["type", "/pattern here", "type"]
		}
	},
	"/Users/x.truth//type/[1]/Anonymous": {
		uri: {
			protocol: "file:",
			retractionCount: 0,
			isRelative: false,
			stores: ["Users"],
			file: "x.truth",
			ext: ".truth",
			types: ["type", "1", "Anonymous"]
		}
	},
	"http://abc.xyz/file.truth//type/path/here": {
		uri: {
			protocol: "http:",
			retractionCount: 0,
			isRelative: false,
			stores: ["abc.xyz"],
			file: "file.truth",
			ext: ".truth",
			types: ["type", "path", "here"]
		},
		emit: "http://abc.xyz/file.truth//type/path/here"
	},
	
	//# Comments
	
	"//": {
		comment: true
	},
	"\t//": {
		comment: true
	},
	" //": {
		comment: true
	},
	"// ": {
		comment: true
	},
	"// :": {
		comment: true
	},
	
	//# Escaping
	
	"D\\: E: F": {
		emit: "D\\: E : F",
		annotations: "F"
	},
	"\\ SpaceThenEscape": {
		emit: "\tSpaceThenEscape"
	},
	"\\ \\ I'm : Drunk": {
		emit: "\t\tI'm : Drunk",
		annotations: "Drunk"
	},
	"\\\t \\ \\\tEsc-Tab-Spc-Esc-Spc-Esc-Tab": {
		emit: "\t\t\t\tEsc-Tab-Spc-Esc-Spc-Esc-Tab"
	},
	
	//# Strange slash usage
	
	"/": {
		unparsable: true
	},
	"/ :": {
		unparsable: true
	},
	"\\/": {
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
	
	//# Unicode
	
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
	
	//# Strange colon usage
	
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
	
	//# Strange comma usage
	
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
	
	//# Pattern Partiality & Totality flags
	
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
	"/foo/, : X": {
		partial: true,
		match: "foo/,",
		annotations: "X"
	},
	"/foo/, bar : X": {
		partial: true,
		match: "foo/, bar",
		annotations: "X"
	},
	
	//# Pattern Sets
	
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
	
	//# Patterns with unicode
	
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
	"/\\u{Thai}": {
		partial: true,
		match: ["฿", "๛"],
		noMatch: ["A", "0"]
	},
	
	//# Pattern Quantifiers
	
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
	
	//# Non Pattern Quantifiers
	
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
		match: "2{}"
	},
	"/\\d{ } : X": {
		annotations: "X",
		partial: true,
		match: "2{ }"
	},
	
	//# Pattern Groups
	
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
		match: ["A", "B", "C", "D"]
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
	
	//# Pattern Infixes
	
	"/</Pat/> : X": {
		partial: true,
		infixes: [{ kind: "Pattern", lhs: "Pat" }],
		annotations: "X"
	},
	"/< : Port> : X": {
		partial: true,
		infixes: [{ kind: "Portability", rhs: "Port" }],
		annotations: "X"
	},
	"/<Pop> : X": {
		partial: true,
		infixes: [{ kind: "Population", lhs: "Pop" }],
		annotations: "X"
	},
	"/<Pop1, Pop2> : X": {
		partial: true,
		infixes: [{ kind: "Population", lhs: ["Pop1", "Pop2"] }],
		annotations: "X"
	},
	"/==<A, B : C, D>==<E, F : G, H>==/ : X, Y, Z": {
		total: true,
		infixes: [
			{ kind: "Population", lhs: ["A", "B"], rhs: ["C", "D"] },
			{ kind: "Population", lhs: ["E", "F"], rhs: ["G", "H"] }
		],
		match: "==??==??==",
		noMatch: "==??=??==",
		annotations: ["X", "Y", "Z"]
	},
	"/<Pop1, Pop2 : A, B> : X": {
		partial: true,
		infixes: [{ kind: "Population", lhs: ["Pop1", "Pop2"], rhs: ["A", "B"] }],
		annotations: "X"
	},
	"/<<Nom>> : X": {
		partial: true,
		infixes: [{ kind: "Nominal", lhs: "Nom" }],
		annotations: "X"
	},
	"/==(<These>|<Arent>|<Infixes>)== : X": {
		infixes: [],
		annotations: "X"
	},
	"/==<InfixWithStar>*== : X": {
		unparsable: true
	},
	"/==<InfixWithPlus>+== : X": {
		unparsable: true
	},
	"/==<InfixWithRange>{1,2}== : X": {
		unparsable: true
	}
};
