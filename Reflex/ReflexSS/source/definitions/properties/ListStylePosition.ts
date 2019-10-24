
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`list-style-position`** CSS property sets the position of the `::marker` relative to a list item.
		 * 
		 * **Initial value**: `outside`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style-position
		 */
		listStylePosition(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`list-style-position`** CSS property sets the position of the `::marker` relative to a list item.
		 * 
		 * **Initial value**: `outside`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style-position
		 */
		listStylePosition(values: CssValue[][]): Command;
		/**
		 * The **`list-style-position`** CSS property sets the position of the `::marker` relative to a list item.
		 * 
		 * **Initial value**: `outside`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style-position
		 */
		"list-style-position"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`list-style-position`** CSS property sets the position of the `::marker` relative to a list item.
		 * 
		 * **Initial value**: `outside`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style-position
		 */
		"list-style-position"(values: CssValue[][]): Command;
	}
}
