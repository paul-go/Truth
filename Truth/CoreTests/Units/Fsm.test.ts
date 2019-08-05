import * as X from "../X";
import "../Framework/TestExtensionsImplementation";


//
describe("Fsm Tests", () =>
{
	//
	test("Basic", () =>
	{
		const transitions = new X.TransitionMap({
			0: { a: 1 },
			1: { b: 2 },
			2: { c: 3 }
		});
		
		const abc = new X.Fsm(
			new X.AlphabetBuilder("a", "b", "c").toAlphabet(),
			new Set([0, 1, 2, 3]),
			0,
			new Set([3]),
			transitions);
		
		expect(abc.add(abc).states.size).toBe(7);
		expect(abc.star().states.size).toBe(3);
		expect(abc.multiply(3).states.size).toBe(10);
		expect(abc.reverse().states.size).toBe(4);
		expect(abc.or(abc).states.size).toBe(4);
		expect(abc.and(abc).states.size).toBe(4);
		expect(abc.xor(abc).states.size).toBe(1);
		expect(abc.difference(abc).states.size).toBe(1);
	});
});
