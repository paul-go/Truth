
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`empty-cells`** CSS property sets whether borders and backgrounds appear around `<table>` cells that have no visible content.
		 * 
		 * **Initial value**: `show`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **1**  | **1.2** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/empty-cells
		 */
		emptyCells(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`empty-cells`** CSS property sets whether borders and backgrounds appear around `<table>` cells that have no visible content.
		 * 
		 * **Initial value**: `show`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **1**  | **1.2** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/empty-cells
		 */
		emptyCells(values: CssValue[][]): Command;
		/**
		 * The **`empty-cells`** CSS property sets whether borders and backgrounds appear around `<table>` cells that have no visible content.
		 * 
		 * **Initial value**: `show`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **1**  | **1.2** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/empty-cells
		 */
		"empty-cells"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`empty-cells`** CSS property sets whether borders and backgrounds appear around `<table>` cells that have no visible content.
		 * 
		 * **Initial value**: `show`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **1**  | **1.2** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/empty-cells
		 */
		"empty-cells"(values: CssValue[][]): Command;
	}
}
