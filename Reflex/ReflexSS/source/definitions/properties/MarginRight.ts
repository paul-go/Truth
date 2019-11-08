
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`margin-right`** CSS property sets the margin area on the right side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/margin-right
		 */
		marginRight(...values: CssValue[]): Command;
		/**
		 * The **`margin-right`** CSS property sets the margin area on the right side of an element. A positive value places it farther from its neighbors, while a negative value places it closer.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/margin-right
		 */
		marginRight(...values: CssValue[][]): Command;
	}
}
