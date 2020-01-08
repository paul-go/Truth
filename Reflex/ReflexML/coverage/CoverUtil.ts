
namespace Reflex.ML
{
	/**
	 * 
	 */
	export function render(...atoms: HTMLElement[])
	{
		document.body.append(...atoms);
	}
	
	/** */
	export function makeNumber()
	{
		return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
	}
	
	/** */
	export function makeString()
	{
		return makeNumber().toString(36);
	}
}
