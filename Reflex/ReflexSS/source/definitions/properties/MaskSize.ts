
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`mask-size`** CSS property specifies the sizes of the mask images. The size of the image can be fully or partially constrained in order to preserve its intrinsic ratio.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * |   Chrome    | Firefox |   Safari    |  Edge  | IE  |
		 * | :---------: | :-----: | :---------: | :----: | :-: |
		 * | **4** _-x-_ | **53**  | **4** _-x-_ | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-size
		 */
		maskSize(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`mask-size`** CSS property specifies the sizes of the mask images. The size of the image can be fully or partially constrained in order to preserve its intrinsic ratio.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * |   Chrome    | Firefox |   Safari    |  Edge  | IE  |
		 * | :---------: | :-----: | :---------: | :----: | :-: |
		 * | **4** _-x-_ | **53**  | **4** _-x-_ | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-size
		 */
		maskSize(values: CssValue[][]): Command;
		/**
		 * The **`mask-size`** CSS property specifies the sizes of the mask images. The size of the image can be fully or partially constrained in order to preserve its intrinsic ratio.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * |   Chrome    | Firefox |   Safari    |  Edge  | IE  |
		 * | :---------: | :-----: | :---------: | :----: | :-: |
		 * | **4** _-x-_ | **53**  | **4** _-x-_ | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-size
		 */
		"mask-size"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`mask-size`** CSS property specifies the sizes of the mask images. The size of the image can be fully or partially constrained in order to preserve its intrinsic ratio.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * |   Chrome    | Firefox |   Safari    |  Edge  | IE  |
		 * | :---------: | :-----: | :---------: | :----: | :-: |
		 * | **4** _-x-_ | **53**  | **4** _-x-_ | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-size
		 */
		"mask-size"(values: CssValue[][]): Command;
	}
}
