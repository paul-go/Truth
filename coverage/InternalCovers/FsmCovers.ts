
namespace Cover
{
	/** * /
	export async function coverFsm()
	{
		const transitions = new Truth.TransitionMap({
			0: { a: 1 },
			1: { b: 2 },
			2: { c: 3 }
		});
		
		const abc = new Truth.Fsm(
			new Truth.AlphabetBuilder("a", "b", "c").toAlphabet(),
			new Set([0, 1, 2, 3]),
			0,
			new Set([3]),
			transitions);
		
		return [
			() => abc.add(abc).states.size === 7,
			() => abc.star().states.size === 3,
			() => abc.multiply(3).states.size === 10,
			() => abc.reverse().states.size === 4,
			() => abc.or(abc).states.size === 4,
			() => abc.and(abc).states.size === 4,
			() => abc.xor(abc).states.size === 1,
			() => abc.difference(abc).states.size === 1
		];
	}
	*/
}
