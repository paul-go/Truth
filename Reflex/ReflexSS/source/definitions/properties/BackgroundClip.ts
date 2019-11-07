
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`background-clip`** CSS property sets whether an element's background `<color>` or `<image>` extends underneath its border.
		 * 
		 * **Initial value**: `border-box`
		 * 
		 * | Chrome | Firefox |   Safari    |  Edge  |  IE   |
		 * | :----: | :-----: | :---------: | :----: | :---: |
		 * | **1**  |  **4**  | **3** _-x-_ | **12** | **9** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-clip
		 */
		backgroundClip(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`background-clip`** CSS property sets whether an element's background `<color>` or `<image>` extends underneath its border.
		 * 
		 * **Initial value**: `border-box`
		 * 
		 * | Chrome | Firefox |   Safari    |  Edge  |  IE   |
		 * | :----: | :-----: | :---------: | :----: | :---: |
		 * | **1**  |  **4**  | **3** _-x-_ | **12** | **9** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-clip
		 */
		backgroundClip(values: CssValue[][]): Command;
	}
}
