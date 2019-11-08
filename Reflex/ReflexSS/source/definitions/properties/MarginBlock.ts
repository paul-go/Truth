
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`margin-block`** CSS property defines the logical block start and end margins of an element, which maps to physical margins depending on the element's writing mode, directionality, and text orientation.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **69** | **66**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/margin-block
		 */
		marginBlock(...values: CssValue[]): Command;
		/**
		 * The **`margin-block`** CSS property defines the logical block start and end margins of an element, which maps to physical margins depending on the element's writing mode, directionality, and text orientation.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **69** | **66**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/margin-block
		 */
		marginBlock(...values: CssValue[][]): Command;
	}
}
