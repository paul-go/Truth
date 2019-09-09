import { System } from "./System";
import { PLABase } from "./PLA";
import * as Operations from "./Operations";
import * as Truth from "truth-compiler";

const Person = {
  typePath: ["Person"],
  Name: {
    typePath: ["Person", "Name"],
  },
  Age: {
    typePath: ["Person", "Age"],
  }
};

const Employee = {
  typePath: ["Employee"],
  Name: {
    typePath: ["Employee", "Name"],
  },
  Age: {
    typePath: ["Employee", "Age"],
  },
  Salary: {
    typePath: ["Employee", "Salary"],
  }
};

async function main() 
{
	await System.fromFile("./example.truth");
	const doc = System.this.doc;
	const types = doc.types;

	const PersonType = doc.query("Person")!;
	const EmployeeType = doc.query("Employee")!;

	// #- Query...

	const query = System.this.query();
	query.addOperation(new Operations.IsOperation(EmployeeType));
	const ret = query.run();

	debugger;
}

main();
