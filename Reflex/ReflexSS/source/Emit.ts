
namespace Reflex.SS
{
	/**
	 * Specifies the options for the .emit() function.
	 */
	export interface IEmitOptions
	{
		/**
		 * Specifies whether the CSS should be emitted as inline
		 * text in the form "property1: value; property2: value", suitable
		 * for assignment to the .cssText field in the style attribute
		 * of HTMLElement objects.
		 * 
		 * When set to true, only the declarations in the top-level rule
		 * are emitted. Nested rules and directive blocks are ignored.
		 */
		inline?: boolean;
		
		/**
		 * Specifies whether the CSS should be emitted in a readable
		 * format. If unspecified, the value is assumed to be true.
		 */
		format?: boolean;
	}
	
	/**
	 * @internal
	 * (See the explanation in Definitions.ts)
	 */
	export function emit(options: IEmitOptions)
	{
		return "";
	}
}
