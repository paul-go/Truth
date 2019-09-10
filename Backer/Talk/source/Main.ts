import * as X from "./X";
import { tt } from "./X";
import * as Truth from "truth-compiler";

const Person = {
	typePath: ["Person"],
	Name: {
		typePath: ["Person", "Name"]
	},
	Age: {
		typePath: ["Person", "Age"]
	}
};

const Employee = {
	typePath: ["Employee"],
	Name: {
		typePath: ["Employee", "Name"]
	},
	Age: {
		typePath: ["Employee", "Age"]
	},
	Salary: {
		typePath: ["Employee", "Salary"]
	}
};

async function main() 
{
	await X.System.fromFile("./example.truth");

	const doc = X.System.this.doc;

	const query = tt(Employee, tt.has(Employee.Salary, tt.greaterThan(1000)));

	debugger;
}

main();
