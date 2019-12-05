
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`resize`** CSS property sets whether an element is resizable, and if so, in which directions.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **1**  |  **4**  | **3**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/resize
		 */
		resize(...values: CssValue[]): Command;
		/**
		 * The **`resize`** CSS property sets whether an element is resizable, and if so, in which directions.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **1**  |  **4**  | **3**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/resize
		 */
		resize(...values: CssValue[][]): Command;
	}
}
