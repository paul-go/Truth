
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-overflow`** CSS property sets how hidden overflow content is signaled to users. It can be clipped, display an ellipsis ('`…`'), or display a custom string.
		 * 
		 * **Initial value**: `clip`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **7**  | **1.3** | **12** | **6** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-overflow
		 */
		textOverflow(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-overflow`** CSS property sets how hidden overflow content is signaled to users. It can be clipped, display an ellipsis ('`…`'), or display a custom string.
		 * 
		 * **Initial value**: `clip`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **7**  | **1.3** | **12** | **6** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-overflow
		 */
		textOverflow(values: CssValue[][]): Command;
	}
}
