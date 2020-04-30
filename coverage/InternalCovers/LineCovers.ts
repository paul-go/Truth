/**
 * This file acts as an early specification for the Truth parser.
 * Although there is no standardized Truth specification
 * at the time of this writing, this acceptance criteria can
 * act as a guide for other Truth compiler implementations.
 * As Truth is a line-based language, these acceptance
 * entries specify the behavior when one single line is fed
 * to the parser.
 */

namespace CoverTruth
{
	function coverLineParse1()
	{
		return createLineCover("", {
			whitespace: true,
			emit: ""
		});
	}
}

namespace CoverTruth
{
	function coverLineParse2()
	{
		return createLineCover("Backslash\\", {
			emit: "Backslash\\"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse3()
	{
		return createLineCover("A,B: C,D", {
			emit: "A, B : C, D",
			annotations: ["C", "D"]
		});
	}
}

namespace CoverTruth
{
	function coverLineParse4()
	{
		return createLineCover("\\A", {
			emit: "A"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse5()
	{
		return createLineCover("A:B: C", {
			emit: "A:B : C",
			annotations: "C"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse9()
	{
		return createLineCover("TabSpcTabSpc\t \t : \t TabSpc", {
			annotations: "TabSpc",
			emit: "TabSpcTabSpc : TabSpc"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse10()
	{
		return createLineCover(": Anon1, Anon2", {
			annotations: ["Anon1", "Anon2"],
			emit: ": Anon1, Anon2"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse11()
	{
		return createLineCover("\t:\tAnon", {
			annotations: ["Anon"],
			emit: "\t: Anon"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse12()
	{
		return createLineCover("\t\t", {
			emit: "\t\t"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse13()
	{
		return createLineCover(" \t ", {
			emit: "\t\t\t"
		});
	}
}

//# URIs

namespace CoverTruth
{
	function coverLineParse14()
	{
		return createLineCover("/x.truth", {
			uri: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse15()
	{
		return createLineCover("./file-with-unknown-extension.txt", {
			uri: undefined
		});
	}
}

namespace CoverTruth
{
	function coverLineParse16()
	{
		return createLineCover("./path/file.truth", {
			uri: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse17()
	{
		return createLineCover("../../path/file.truth", {
			uri: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse18()
	{
		return createLineCover("http://path/to/file.truth", {
			uri: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse19()
	{
		return createLineCover("http://127.0.0.1:8000/file.truth", {
			uri: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse20()
	{
		return createLineCover("http://127.0.0.1:800099/file.truth", {
			uri: undefined
		});
	}
}

namespace CoverTruth
{
	function coverLineParse21()
	{
		return createLineCover("http://127.0.0.1:8000XYZ/file.truth", {
			uri: undefined
		});
	}
}

namespace CoverTruth
{
	function coverLineParse22()
	{
		return createLineCover("/absolute/file.truth", {
			uri: true
		});
	}
}

//# Comments

namespace CoverTruth
{
	function coverLineParse23()
	{
		return createLineCover("//", {
			comment: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse24()
	{
		return createLineCover("\t//", {
			comment: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse25()
	{
		return createLineCover(" //", {
			comment: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse26()
	{
		return createLineCover("// ", {
			comment: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse27()
	{
		return createLineCover("// :", {
			comment: true
		});
	}
}

//# Escaping

namespace CoverTruth
{
	function coverLineParse28()
	{
		return createLineCover("D\\: E: F", {
			emit: "D\\: E : F",
			annotations: "F"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse29()
	{
		return createLineCover("\\ SpaceThenEscape", {
			emit: "\tSpaceThenEscape"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse30()
	{
		return createLineCover("\\ \\ I'm : Drunk", {
			emit: "\t\tI'm : Drunk",
			annotations: "Drunk"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse31()
	{
		return createLineCover("\\\t \\ \\\tEsc-Tab-Spc-Esc-Spc-Esc-Tab", {
			emit: "\t\t\t\tEsc-Tab-Spc-Esc-Spc-Esc-Tab"
		});
	}
}

//# Strange slash usage

namespace CoverTruth
{
	function coverLineParse32()
	{
		return createLineCover("/", {
			unparsable: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse33()
	{
		return createLineCover("/ :", {
			unparsable: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse34()
	{
		return createLineCover("\\/", {
			emit: "\\/",
			partial: false,
			total: false
		});
	}
}

namespace CoverTruth
{
	function coverLineParse35()
	{
		return createLineCover("A, /, B : C, /, D", {
			emit: "A, \\/, B : C, /, D",
			annotations: ["C", "/", "D"],
			joint: 8
		});
	}
}

namespace CoverTruth
{
	function coverLineParse36()
	{
		return createLineCover("/, A, B", {
			// Why is this unparsable?
			unparsable: true 
		});
	}
}

//# Unicode

namespace CoverTruth
{
	function coverLineParse37()
	{
		return createLineCover("🐇 : Bunny", {
			emit: "🐇 : Bunny"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse38()
	{
		return createLineCover("🐇, 🐇 : 🐇, 🐇", {
			emit: "🐇, 🐇 : 🐇, 🐇"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse39()
	{
		return createLineCover("Σ, 🐇, ★ : Sigma, Bunny, Star", {
			emit: "Σ, 🐇, ★ : Sigma, Bunny, Star"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse40()
	{
		return createLineCover("\u{1F407} : NotBunny", {
			emit: "\u{1F407} : NotBunny"
		});
	}
}

//# Strange colon usage

namespace CoverTruth
{
	function coverLineParse41()
	{
		return createLineCover("A : B\\", {
			emit: "A : B\\",
			annotations: "B\\"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse42()
	{
		return createLineCover(":::", {
			emit: ":: :",
			joint: 2
		});
	}
}

namespace CoverTruth
{
	function coverLineParse43()
	{
		return createLineCover("::\\: :", {
			emit: "::: :",
			joint: 5
		});
	}
}

namespace CoverTruth
{
	function coverLineParse44()
	{
		return createLineCover(":: :\\:", {
			emit: ": : ::",
			joint: 1
		});
	}
}

//# Strange comma usage

namespace CoverTruth
{
	function coverLineParse45()
	{
		return createLineCover("X,,,", {
			emit: "X",
			joint: -1
		});
	}
}

namespace CoverTruth
{
	function coverLineParse46()
	{
		return createLineCover(",", {
			unparsable: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse47()
	{
		return createLineCover(", A, B : C, D", {
			unparsable: true
		});
	}
}

//# Pattern Partiality & Totality flags

namespace CoverTruth
{
	function coverLineParse48()
	{
		return createLineCover("/total/ : X", {
			annotations: "X",
			total: true,
			match: "total"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse49()
	{
		return createLineCover("/partial : X", {
			annotations: "X",
			partial: true,
			match: "partial"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse50()
	{
		return createLineCover("/partial-with-escaped-delimiter\\/ : X", {
			annotations: "X",
			partial: true,
			match: "partial-with-escaped-delimiter/"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse51()
	{
		return createLineCover("/partial/with/slashes : X", {
			annotations: "X",
			partial: true,
			match: "partial/with/slashes"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse52()
	{
		return createLineCover("\\/non-pattern/ : X", {
			annotations: "X",
			partial: false,
			total: false,
			emit: "\\/non-pattern/ : X"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse53()
	{
		return createLineCover("/foo/, : X", {
			partial: true,
			match: "foo/,",
			annotations: "X"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse54()
	{
		return createLineCover("/foo/, bar : X", {
			partial: true,
			match: "foo/, bar",
			annotations: "X"
		});
	}
}

//# Pattern Sets

namespace CoverTruth
{
	function coverLineParse55()
	{
		return createLineCover("/[A-Z]/ : X", {
			annotations: "X",
			total: true,
			match: "B",
			noMatch: ["-", "AA"]
		});
	}
}

namespace CoverTruth
{
	function coverLineParse56()
	{
		return createLineCover("/[A-Z\\d]/ : X", {
			annotations: "X",
			total: true,
			match: ["A", "Z", "5"],
			noMatch: ["-", "d"]
		});
	}
}

namespace CoverTruth
{
	function coverLineParse57()
	{
		return createLineCover("/[A\\tB] : X", {
			annotations: "X",
			total: false,
			match: ["A", "B"],
			noMatch: ["AtB", "A\\tB", "A	B", "\t"]
		});
	}
}

namespace CoverTruth
{
	function coverLineParse58()
	{
		return createLineCover("/[\\t-\\\\]/ : X", {
			annotations: "X",
			total: true,
			match: ["$", "0", "9", ":", "=", "<", ">", "A", "Z", "[", "\\"],
			noMatch: ["\t", String.fromCodePoint(0), "]", "a"]
		});
	}
}

namespace CoverTruth
{
	function coverLineParse59()
	{
		return createLineCover("/-[\\t-\\\\]-/ : X", {
			annotations: "X",
			total: true,
			match: ["-\t-", "-$-"]
		});
	}
}

//# Patterns with unicode

namespace CoverTruth
{
	function coverLineParse60()
	{
		return createLineCover("/\\u{1F407}/", {
			total: true,
			match: "🐇",
			noMatch: "\\u{1F407}"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse61()
	{
		return createLineCover("/\\uFFFF🐇 : X", {
			partial: true,
			match: "uFFFF🐇",
			noMatch: "\uFFFF🐇"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse62()
	{
		return createLineCover("/\\u{FFFF🐇 : X", {
			partial: true,
			match: "u{FFFF🐇",
			noMatch: "\\uFFFF🐇"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse63()
	{
		return createLineCover("/\\u{Thai}", {
			partial: true,
			match: ["฿", "๛"],
			noMatch: ["A", "0"]
		});
	}
}

//# Pattern Quantifiers

namespace CoverTruth
{
	function coverLineParse64()
	{
		return createLineCover("/\\d+ : X", {
			annotations: "X",
			partial: true,
			match: "1234"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse65()
	{
		return createLineCover("/x\\d* : X", {
			annotations: "X",
			partial: true,
			match: ["x", "x1", "x2"]
		});
	}
}

namespace CoverTruth
{
	function coverLineParse66()
	{
		return createLineCover("/x\\d{0} : X", {
			annotations: "X",
			partial: true,
			match: "x",
			noMatch: "x4"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse67()
	{
		return createLineCover("/\\d{3,} : X", {
			annotations: "X",
			partial: true,
			match: ["123", "1234"],
			noMatch: "12"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse68()
	{
		return createLineCover("/\\d{3,6} : X", {
			annotations: "X",
			partial: true,
			match: "12345",
			noMatch: ["12", "1234567"]
		});
	}
}

//# Non Pattern Quantifiers

namespace CoverTruth
{
	function coverLineParse69()
	{
		return createLineCover("/\\d{,3} : X", {
			annotations: "X",
			partial: true,
			match: "2{,3}",
			noMatch: "123"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse70()
	{
		return createLineCover("/\\d{x,} : X", {
			annotations: "X",
			partial: true,
			match: "2{x,}"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse71()
	{
		return createLineCover("/\\d{} : X", {
			annotations: "X",
			partial: true,
			match: "2{}"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse72()
	{
		return createLineCover("/\\d{ } : X", {
			annotations: "X",
			partial: true,
			match: "2{ }"
		});
	}
}

//# Pattern Groups

namespace CoverTruth
{
	function coverLineParse73()
	{
		return createLineCover("/(A|B) : X", {
			annotations: "X",
			partial: true,
			match: "A",
			noMatch: "|"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse74()
	{
		return createLineCover("/(A||B) : X", {
			annotations: "X",
			partial: true,
			match: "A",
			noMatch: ""
		});
	}
}

namespace CoverTruth
{
	function coverLineParse75()
	{
		return createLineCover("/(A|B|C|D) : X", {
			annotations: "X",
			partial: true,
			match: ["A", "B", "C", "D"]
		});
	}
}

namespace CoverTruth
{
	function coverLineParse76()
	{
		return createLineCover("/([0-5]|[a-c]|[e-f]) : X", {
			annotations: "X",
			partial: true,
			match: ["0", "a", "e"]
		});
	}
}

namespace CoverTruth
{
	function coverLineParse77()
	{
		return createLineCover("/([0-5]*|[a-c]+|[e-f]{2}) : X", {
			annotations: "X",
			partial: true,
			match: ["000", "aaa", "ee"],
			noMatch: ["6", "eee"]
		});
	}
}

//# Pattern with escapables

namespace CoverTruth
{
	function coverLineParse78()
	{
		return createLineCover("/(\\+)", {
			partial: true,
			unparsable: false
		});
	}
}

//# Pattern Infixes

namespace CoverTruth
{
	function coverLineParse79()
	{
		return createLineCover("/</Pat/> : X", {
			partial: true,
			infixes: [{ kind: "Pattern", lhs: "Pat" }],
			annotations: "X"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse80()
	{
		return createLineCover("/< : Port> : X", {
			partial: true,
			infixes: [{ kind: "Portability", rhs: "Port" }],
			annotations: "X"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse81()
	{
		return createLineCover("/<Pop> : X", {
			partial: true,
			infixes: [{ kind: "Population", lhs: "Pop" }],
			annotations: "X"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse82()
	{
		return createLineCover("/<Pop1, Pop2> : X", {
			partial: true,
			infixes: [{ kind: "Population", lhs: ["Pop1", "Pop2"] }],
			annotations: "X"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse83()
	{
		return createLineCover("/==<A, B : C, D>==<E, F : G, H>==/ : X, Y, Z", {
			total: true,
			infixes: [
				{ kind: "Population", lhs: ["A", "B"], rhs: ["C", "D"] },
				{ kind: "Population", lhs: ["E", "F"], rhs: ["G", "H"] }
			],
			match: "==??==??==",
			noMatch: "==??=??==",
			annotations: ["X", "Y", "Z"]
		});
	}
}

namespace CoverTruth
{
	function coverLineParse84()
	{
		return createLineCover("/<Pop1, Pop2 : A, B> : X", {
			partial: true,
			infixes: [{ kind: "Population", lhs: ["Pop1", "Pop2"], rhs: ["A", "B"] }],
			annotations: "X"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse85()
	{
		return createLineCover("/<<Nom>> : X", {
			partial: true,
			infixes: [{ kind: "Nominal", lhs: "Nom" }],
			annotations: "X"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse86()
	{
		return createLineCover("/==(<These>|<Arent>|<Infixes>)== : X", {
			infixes: [],
			annotations: "X"
		});
	}
}

namespace CoverTruth
{
	function coverLineParse87()
	{
		return createLineCover("/==<InfixWithStar>*== : X", {
			unparsable: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse88()
	{
		return createLineCover("/==<InfixWithPlus>+== : X", {
			unparsable: true
		});
	}
}

namespace CoverTruth
{
	function coverLineParse89()
	{
		return createLineCover("/==<InfixWithRange>{1,2}== : X", {
			unparsable: true
		});
	}
}
