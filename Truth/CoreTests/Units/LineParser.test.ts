import * as X from "../X";
import * as T from "../T";
import "../Framework/TestExtensions";


//
describe.only("Parser Tests", () =>
{
	//
	test.only("Basic", () =>
	{
		T.ParseTest.exec("", {
			flags: X.LineFlags.isWhitespace,
			emit: ""
		});
		
		T.ParseTest.exec("/", {
			flags: X.LineFlags.none
		});
		
		T.ParseTest.exec("Backslash\\", {
			emit: "Backslash\\",
			annotations: [],
		});
		
		T.ParseTest.exec("A, B : C, D", {
			emit: "A, B : C, D",
			annotations: ["C", "D"]
		});
		
		// Escaping
		
		T.ParseTest.exec("\A", {
			emit: "A",
			annotations: ""
		});
		
		T.ParseTest.exec("A:B: C", {
			emit: "A:B : C",
			annotations: "C"
		});
		
		T.ParseTest.exec("A\: B: C", {
			emit: "A\: B : C",
			annotations: "C"
		});
		
		T.ParseTest.exec("\ A", {
			emit: "A",
			annotations: ""
		});
		
		T.ParseTest.exec("A : B\\", {
			emit: "A : B\\",
			annotations: "B\\"
		});
		
		// Pattern Parsing
		T.ParseTest.exec("/[A-Z]/ : X", {
			flags: X.LineFlags.hasPattern,
			match: "B"
		});
		
		T.ParseTest.exec("/[A-Z\d]/ : X", {
			flags: X.LineFlags.hasPattern,
			match: "5"
		});
		
		// Pattern Quantifiers
		T.ParseTest.exec("/\d+ : X", {
			flags: [X.LineFlags.hasPattern, X.LineFlags.hasPartialPattern],
			match: "1234"
		});
		
		T.ParseTest.exec("/x\d* : X", {
			flags: [X.LineFlags.hasPattern, X.LineFlags.hasPartialPattern],
			match: ["x", "x1", "x2"]
		});
		
		T.ParseTest.exec("/x\d{0} : X", {
			flags: [X.LineFlags.hasPattern, X.LineFlags.hasPartialPattern],
			match: "x",
			noMatch: "x4"
		});
		
		T.ParseTest.exec("/\d{2,} : X", {
			flags: [X.LineFlags.hasPattern, X.LineFlags.hasPartialPattern],
			match: "123",
			noMatch: "12"
		});
		
		T.ParseTest.exec("/\d{3,6} : X", {
			flags: [X.LineFlags.hasPattern, X.LineFlags.hasPartialPattern],
			match: "12345"
		});
		
		// Non Pattern Quantifiers
		T.ParseTest.exec("/\d{,3} : X", {
			flags: [X.LineFlags.hasPattern, X.LineFlags.hasPartialPattern],
			match: "2{,3}",
			noMatch: "123"
		});
		
		T.ParseTest.exec("/\d{x,} : X", {
			flags: [X.LineFlags.hasPattern, X.LineFlags.hasPartialPattern],
			match: "2{x,}"
		});
		
		
		
	});
});
