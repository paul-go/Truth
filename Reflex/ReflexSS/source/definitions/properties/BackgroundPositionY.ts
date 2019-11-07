
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`background-position-y`** CSS property sets the initial vertical position, relative to the background position layer defined by `background-origin`, for each defined background image.
		 * 
		 * **Initial value**: `top`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  | **49**  | **1**  | **12** | **6** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-position-y
		 */
		backgroundPositionY(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`background-position-y`** CSS property sets the initial vertical position, relative to the background position layer defined by `background-origin`, for each defined background image.
		 * 
		 * **Initial value**: `top`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  | **49**  | **1**  | **12** | **6** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-position-y
		 */
		backgroundPositionY(values: CssValue[][]): Command;
	}
}
