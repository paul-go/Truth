
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`box-shadow`** CSS property adds shadow effects around an element's frame. You can set multiple effects separated by commas. A box shadow is described by X and Y offsets relative to the element, blur and spread radii, and color.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * | **10**  |  **4**  | **5.1** | **12** | **9** |
		 * | 1 _-x-_ |         | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/box-shadow
		 */
		boxShadow(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`box-shadow`** CSS property adds shadow effects around an element's frame. You can set multiple effects separated by commas. A box shadow is described by X and Y offsets relative to the element, blur and spread radii, and color.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * | **10**  |  **4**  | **5.1** | **12** | **9** |
		 * | 1 _-x-_ |         | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/box-shadow
		 */
		boxShadow(values: CssValue[][]): Command;
		/**
		 * The **`box-shadow`** CSS property adds shadow effects around an element's frame. You can set multiple effects separated by commas. A box shadow is described by X and Y offsets relative to the element, blur and spread radii, and color.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * | **10**  |  **4**  | **5.1** | **12** | **9** |
		 * | 1 _-x-_ |         | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/box-shadow
		 */
		"box-shadow"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`box-shadow`** CSS property adds shadow effects around an element's frame. You can set multiple effects separated by commas. A box shadow is described by X and Y offsets relative to the element, blur and spread radii, and color.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * | **10**  |  **4**  | **5.1** | **12** | **9** |
		 * | 1 _-x-_ |         | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/box-shadow
		 */
		"box-shadow"(values: CssValue[][]): Command;
	}
}
