
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-collapse`** CSS property sets whether cells inside a `<table>` have shared or separate borders.
		 * 
		 * **Initial value**: `separate`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **1**  | **1.2** | **12** | **5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-collapse
		 */
		borderCollapse(...values: CssValue[]): Command;
		/**
		 * The **`border-collapse`** CSS property sets whether cells inside a `<table>` have shared or separate borders.
		 * 
		 * **Initial value**: `separate`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **1**  | **1.2** | **12** | **5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-collapse
		 */
		borderCollapse(...values: CssValue[][]): Command;
	}
}
