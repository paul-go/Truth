import * as X from "../X";
import "../Framework/TestExtensions";


//
describe.only("Fsm Tests", () =>
{
	//
	test.only("Basic Fsm", () =>
	{
		const transitions = new X.TransitionMap({
			0: { a: 1 },
			1: { b: 2 },
			2: { c: 3 }
		});
		
		const abc = new X.Fsm(
			new X.Alphabet("a", "b", "c"),
			new Set([0, 1, 2, 3]),
			0,
			new Set([3]),
			transitions);
		
		debugger;
		
		try
		{
			let t1 = abc.add(abc).states.size + " == " + 7;
			let t2 = abc.star().states.size + " == " + 3;
			let t3 = abc.multiply(3).states.size + " == " + 1;
			let t4 = abc.reverse().states.size + " == " + 4;
			let t5 = abc.or(abc).states.size + " == " + 4;
			let t6 = abc.and(abc).states.size + " == " + 4;
			let t7 = abc.xor(abc).states.size + " == " + 1;
			let t8 = abc.difference(abc).states.size + " == " + 1;
		}
		catch (e)
		{
			debugger;
		}
		
		const values = [
			["abc.add(abc).states.size: " + abc.add(abc).states.size + " == " + 7],
			["abc.star().states.size: " + abc.star().states.size + " == " + 3],
			["abc.multiply(3).states.size: " + abc.multiply(3).states.size + " == " + 1],
			["abc.reverse().states.size: " + abc.reverse().states.size + " == " + 4],
			["abc.or(abc).states.size: " + abc.or(abc).states.size + " == " + 4],
			["abc.and(abc).states.size: " + abc.and(abc).states.size + " == " + 4],
			["abc.xor(abc).states.size: " + abc.xor(abc).states.size + " == " + 1],
			["abc.difference(abc).states.size: " + abc.difference(abc).states.size + " == " + 1]
		]
		
		const valuesText = values.join("\n");
		console.log(valuesText);
		
		/*
		expect(abc.add(abc).states.size).toBe(7);
		expect(abc.star().states.size).toBe(3);
		expect(abc.multiply(3).states.size).toBe(10);
		expect(abc.reverse().states.size).toBe(4);
		expect(abc.or(abc).states.size).toBe(4);
		expect(abc.and(abc).states.size).toBe(4);
		expect(abc.xor(abc).states.size).toBe(1);
		expect(abc.difference(abc).states.size).toBe(1);
		.*/
	});
});
