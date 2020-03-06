/**
 * This file acts as an early specification for the Truth parser.
 * Although there is no standardized Truth specification
 * at the time of this writing, this acceptance criteria can
 * act as a guide for other Truth compiler implementations.
 * As Truth is a line-based language, these acceptance
 * entries specify the behavior when one single line is fed
 * to the parser.
 */

namespace Truth
{
	function coverLineParse1()
	{
		return createLineCover("", {
			whitespace: true,
			emit: ""
		});
	}
}

namespace Truth
{
	function coverLineParse2()
	{
		return createLineCover("Backslash\\", {
			emit: "Backslash\\"
		});
	}
}

namespace Truth
{
	function coverLineParse3()
	{
		return createLineCover("A,B: C,D", {
			emit: "A, B : C, D",
			annotations: ["C", "D"]
		});
	}
}

namespace Truth
{
	function coverLineParse4()
	{
		return createLineCover("\\A", {
			emit: "A"
		});
	}
}

namespace Truth
{
	function coverLineParse5()
	{
		return createLineCover("A:B: C", {
			emit: "A:B : C",
			annotations: "C"
		});
	}
}

namespace Truth
{
	function coverLineParse6()
	{
		return createLineCover("Refresh:", {
			refresh: true,
			emit: "Refresh :"
		});
	}
}

namespace Truth
{
	function coverLineParse7()
	{
		return createLineCover("Refresh : ", {
			refresh: true,
			emit: "Refresh :"
		});
	}
}

namespace Truth
{
	function coverLineParse8()
	{
		return createLineCover("R, E, F, R, E, S, H :", {
			refresh: true
		});
	}
}

namespace Truth
{
	function coverLineParse9()
	{
		return createLineCover("TabSpcTabSpc\t \t : \t TabSpc", {
			annotations: "TabSpc",
			emit: "TabSpcTabSpc : TabSpc"
		});
	}
}

namespace Truth
{
	function coverLineParse10()
	{
		return createLineCover(": Anon1, Anon2", {
			annotations: ["Anon1", "Anon2"],
			emit: ": Anon1, Anon2"
		});
	}
}

namespace Truth
{
	function coverLineParse11()
	{
		return createLineCover("\t:\tAnon", {
			annotations: ["Anon"],
			emit: "\t: Anon"
		});
	}
}

namespace Truth
{
	function coverLineParse12()
	{
		return createLineCover("\t\t", {
			emit: "\t\t"
		});
	}
}

namespace Truth
{
	function coverLineParse13()
	{
		return createLineCover(" \t ", {
			emit: "\t\t\t"
		});
	}
}

//# URIs

namespace Truth
{
	function coverLineParse14()
	{
		return createLineCover("/x.truth", {
			uri: true
		});
	}
}

namespace Truth
{
	function coverLineParse15()
	{
		return createLineCover("./file-with-unknown-extension.txt", {
			uri: undefined
		});
	}
}

namespace Truth
{
	function coverLineParse16()
	{
		return createLineCover("./path/file.truth", {
			uri: true
		});
	}
}

namespace Truth
{
	function coverLineParse17()
	{
		return createLineCover("../../path/file.truth", {
			uri: true
		});
	}
}

namespace Truth
{
	function coverLineParse18()
	{
		return createLineCover("http://path/to/file.truth", {
			uri: true
		});
	}
}

namespace Truth
{
	function coverLineParse19()
	{
		return createLineCover("http://127.0.0.1:8000/file.truth", {
			uri: true
		});
	}
}

namespace Truth
{
	function coverLineParse20()
	{
		return createLineCover("http://127.0.0.1:800099/file.truth", {
			uri: undefined
		});
	}
}

namespace Truth
{
	function coverLineParse21()
	{
		return createLineCover("http://127.0.0.1:8000XYZ/file.truth", {
			uri: undefined
		});
	}
}

namespace Truth
{
	function coverLineParse22()
	{
		return createLineCover("/absolute/file.truth", {
			uri: true
		});
	}
}

//# Comments

namespace Truth
{
	function coverLineParse23()
	{
		return createLineCover("//", {
			comment: true
		});
	}
}

namespace Truth
{
	function coverLineParse24()
	{
		return createLineCover("\t//", {
			comment: true
		});
	}
}

namespace Truth
{
	function coverLineParse25()
	{
		return createLineCover(" //", {
			comment: true
		});
	}
}

namespace Truth
{
	function coverLineParse26()
	{
		return createLineCover("// ", {
			comment: true
		});
	}
}

namespace Truth
{
	function coverLineParse27()
	{
		return createLineCover("// :", {
			comment: true
		});
	}
}

//# Escaping

namespace Truth
{
	function coverLineParse28()
	{
		return createLineCover("D\\: E: F", {
			emit: "D\\: E : F",
			annotations: "F"
		});
	}
}

namespace Truth
{
	function coverLineParse29()
	{
		return createLineCover("\\ SpaceThenEscape", {
			emit: "\tSpaceThenEscape"
		});
	}
}

namespace Truth
{
	function coverLineParse30()
	{
		return createLineCover("\\ \\ I'm : Drunk", {
			emit: "\t\tI'm : Drunk",
			annotations: "Drunk"
		});
	}
}

namespace Truth
{
	function coverLineParse31()
	{
		return createLineCover("\\\t \\ \\\tEsc-Tab-Spc-Esc-Spc-Esc-Tab", {
			emit: "\t\t\t\tEsc-Tab-Spc-Esc-Spc-Esc-Tab"
		});
	}
}

//# Strange slash usage

namespace Truth
{
	function coverLineParse32()
	{
		return createLineCover("/", {
			unparsable: true
		});
	}
}

namespace Truth
{
	function coverLineParse33()
	{
		return createLineCover("/ :", {
			unparsable: true
		});
	}
}

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
{
	function coverLineParse37()
	{
		return createLineCover("🐇 : Bunny", {
			emit: "🐇 : Bunny"
		});
	}
}

namespace Truth
{
	function coverLineParse38()
	{
		return createLineCover("🐇, 🐇 : 🐇, 🐇", {
			emit: "🐇, 🐇 : 🐇, 🐇"
		});
	}
}

namespace Truth
{
	function coverLineParse39()
	{
		return createLineCover("Σ, 🐇, ★ : Sigma, Bunny, Star", {
			emit: "Σ, 🐇, ★ : Sigma, Bunny, Star"
		});
	}
}

namespace Truth
{
	function coverLineParse40()
	{
		return createLineCover("\u{1F407} : NotBunny", {
			emit: "\u{1F407} : NotBunny"
		});
	}
}

//# Strange colon usage

namespace Truth
{
	function coverLineParse41()
	{
		return createLineCover("A : B\\", {
			emit: "A : B\\",
			annotations: "B\\"
		});
	}
}

namespace Truth
{
	function coverLineParse42()
	{
		return createLineCover(":::", {
			emit: ":: :",
			joint: 2,
			refresh: true
		});
	}
}

namespace Truth
{
	function coverLineParse43()
	{
		return createLineCover("::\\: :", {
			emit: "::: :",
			joint: 5,
			refresh: true
		});
	}
}

namespace Truth
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

namespace Truth
{
	function coverLineParse45()
	{
		return createLineCover("X,,,", {
			emit: "X",
			joint: -1
		});
	}
}

namespace Truth
{
	function coverLineParse46()
	{
		return createLineCover(",", {
			unparsable: true
		});
	}
}

namespace Truth
{
	function coverLineParse47()
	{
		return createLineCover(", A, B : C, D", {
			unparsable: true
		});
	}
}

//# Pattern Partiality & Totality flags

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
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

namespace Truth
{
	function coverLineParse86()
	{
		return createLineCover("/==(<These>|<Arent>|<Infixes>)== : X", {
			infixes: [],
			annotations: "X"
		});
	}
}

namespace Truth
{
	function coverLineParse87()
	{
		return createLineCover("/==<InfixWithStar>*== : X", {
			unparsable: true
		});
	}
}

namespace Truth
{
	function coverLineParse88()
	{
		return createLineCover("/==<InfixWithPlus>+== : X", {
			unparsable: true
		});
	}
}

namespace Truth
{
	function coverLineParse89()
	{
		return createLineCover("/==<InfixWithRange>{1,2}== : X", {
			unparsable: true
		});
	}
}
