
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`letter-spacing`** CSS property sets the spacing behavior between text characters.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/letter-spacing
		 */
		letterSpacing(...values: CssValue[]): Command;
		/**
		 * The **`letter-spacing`** CSS property sets the spacing behavior between text characters.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/letter-spacing
		 */
		letterSpacing(...values: CssValue[][]): Command;
	}
}
