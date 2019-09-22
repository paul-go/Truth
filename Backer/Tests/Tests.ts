import { test, assert, assertEqual } from "liltest";
import * as files from "./TruthFiles";

test(async function basic() {
	await Talk.System.fromText(files.EmployeePerson.source);
	const query = await tt();
	const result = query.run();
	assertEqual(result.map(r => r.name), ["E1", "E2", "E3", "P1", "P2"]);
});

test(async function operationIs() {
	const { source, PLA } = files.EmployeePerson;
	await Talk.System.fromText(source);
	let query = await tt(tt.is(PLA.Employee as any));
	let result = query.run();
	assertEqual(result.map(r => r.name), ["E1", "E2", "E3"]);

	query = await tt(tt.is(PLA.Person as any));
	result = query.run();
	assertEqual(result.map(r => r.name), ["E1", "E2", "E3", "P1", "P2"]);
});

test(async function operationNot() {
	const { source, PLA } = files.EmployeePerson;
	await Talk.System.fromText(source);
	let query = await tt(tt.not(tt.is(PLA.Employee as any)));
	let result = query.run();
	assertEqual(result.map(r => r.name), ["P1", "P2"]);

	query = await tt(tt.not(tt.is(PLA.Person as any)));
	result = query.run();
	assertEqual(result.map(r => r.name), []);
});

test(async function operationHas() {
	const { source, PLA } = files.EmployeePerson;
	await Talk.System.fromText(source);
	let query = await tt(tt.has(PLA.Employee.Salary));
	let result = query.run();
	assertEqual(result.map(r => r.name), ["E1", "E2", "E3"]);
	query = await tt(tt.has(PLA.Employee.Salary, tt.greaterThan(1000)));
	result = query.run();
	assertEqual(result.map(r => r.name), ["E2", "E3"]);
	query = await tt(tt.has(PLA.Employee.Salary, tt.lessThan(1200)));
	result = query.run();
	assertEqual(result.map(r => r.name), ["E1"]);
});
