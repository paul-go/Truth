
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`table-layout`** CSS property sets the algorithm used to lay out `<table>` cells, rows, and columns.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **14** |  **1**  | **1**  | **12** | **5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/table-layout
		 */
		tableLayout(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`table-layout`** CSS property sets the algorithm used to lay out `<table>` cells, rows, and columns.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **14** |  **1**  | **1**  | **12** | **5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/table-layout
		 */
		tableLayout(values: CssValue[][]): Command;
	}
}
