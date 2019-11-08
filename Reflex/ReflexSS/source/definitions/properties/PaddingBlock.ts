
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`padding-block`** CSS property defines the logical block start and end padding of an element, which maps to physical padding properties depending on the element's writing mode, directionality, and text orientation.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **69** | **66**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/padding-block
		 */
		paddingBlock(...values: CssValue[]): Command;
		/**
		 * The **`padding-block`** CSS property defines the logical block start and end padding of an element, which maps to physical padding properties depending on the element's writing mode, directionality, and text orientation.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **69** | **66**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/padding-block
		 */
		paddingBlock(...values: CssValue[][]): Command;
	}
}
