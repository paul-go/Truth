
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-size`** CSS property sets the size of the font. This property is also used to compute the size of `em`, `ex`, and other relative `<length>` units.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **1**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-size
		 */
		fontSize(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`font-size`** CSS property sets the size of the font. This property is also used to compute the size of `em`, `ex`, and other relative `<length>` units.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **1**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-size
		 */
		fontSize(values: CssValue[][]): Command;
		/**
		 * The **`font-size`** CSS property sets the size of the font. This property is also used to compute the size of `em`, `ex`, and other relative `<length>` units.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **1**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-size
		 */
		"font-size"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`font-size`** CSS property sets the size of the font. This property is also used to compute the size of `em`, `ex`, and other relative `<length>` units.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **1**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-size
		 */
		"font-size"(values: CssValue[][]): Command;
	}
}
