
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`direction`** CSS property sets the direction of text, table columns, and horizontal overflow. Use `rtl` for languages written from right to left (like Hebrew or Arabic), and `ltr` for those written from left to right (like English and most other languages).
		 * 
		 * **Initial value**: `ltr`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **2**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/direction
		 */
		direction(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`direction`** CSS property sets the direction of text, table columns, and horizontal overflow. Use `rtl` for languages written from right to left (like Hebrew or Arabic), and `ltr` for those written from left to right (like English and most other languages).
		 * 
		 * **Initial value**: `ltr`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **2**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/direction
		 */
		direction(values: CssValue[][]): Command;
	}
}
