
namespace Truth
{
	/**
	 * @internal
	 * Generic counter function that returns a
	 * unique (incrementing) number on each call.
	 */
	export function id()
	{
		return ++nextId;
	}
	
	let nextId = 0;
}
