
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`color`** CSS property sets the foreground color value of an element's text and text decorations, and sets the `currentcolor` value. `currentcolor` may be used as an indirect value on _other_ properties and is the default for other color properties, such as `border-color`.
		 * 
		 * **Initial value**: Varies from one browser to another
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/color
		 */
		color(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`color`** CSS property sets the foreground color value of an element's text and text decorations, and sets the `currentcolor` value. `currentcolor` may be used as an indirect value on _other_ properties and is the default for other color properties, such as `border-color`.
		 * 
		 * **Initial value**: Varies from one browser to another
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/color
		 */
		color(values: CssValue[][]): Command;
	}
}
