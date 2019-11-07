
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`margin-block-end`** CSS property defines the logical block end margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **69** | **41**  | **12.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/margin-block-end
		 */
		marginBlockEnd(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`margin-block-end`** CSS property defines the logical block end margin of an element, which maps to a physical margin depending on the element's writing mode, directionality, and text orientation.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **69** | **41**  | **12.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/margin-block-end
		 */
		marginBlockEnd(values: CssValue[][]): Command;
	}
}
