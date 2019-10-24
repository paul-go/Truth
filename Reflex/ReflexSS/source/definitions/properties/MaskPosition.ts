
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`mask-position`** CSS property sets the initial position, relative to the mask position layer set by `mask-origin`, for each defined mask image.
		 * 
		 * **Initial value**: `center`
		 * 
		 * |   Chrome    | Firefox |    Safari     |  Edge  | IE  |
		 * | :---------: | :-----: | :-----------: | :----: | :-: |
		 * | **1** _-x-_ | **53**  | **3.2** _-x-_ | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-position
		 */
		maskPosition(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`mask-position`** CSS property sets the initial position, relative to the mask position layer set by `mask-origin`, for each defined mask image.
		 * 
		 * **Initial value**: `center`
		 * 
		 * |   Chrome    | Firefox |    Safari     |  Edge  | IE  |
		 * | :---------: | :-----: | :-----------: | :----: | :-: |
		 * | **1** _-x-_ | **53**  | **3.2** _-x-_ | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-position
		 */
		maskPosition(values: CssValue[][]): Command;
		/**
		 * The **`mask-position`** CSS property sets the initial position, relative to the mask position layer set by `mask-origin`, for each defined mask image.
		 * 
		 * **Initial value**: `center`
		 * 
		 * |   Chrome    | Firefox |    Safari     |  Edge  | IE  |
		 * | :---------: | :-----: | :-----------: | :----: | :-: |
		 * | **1** _-x-_ | **53**  | **3.2** _-x-_ | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-position
		 */
		"mask-position"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`mask-position`** CSS property sets the initial position, relative to the mask position layer set by `mask-origin`, for each defined mask image.
		 * 
		 * **Initial value**: `center`
		 * 
		 * |   Chrome    | Firefox |    Safari     |  Edge  | IE  |
		 * | :---------: | :-----: | :-----------: | :----: | :-: |
		 * | **1** _-x-_ | **53**  | **3.2** _-x-_ | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-position
		 */
		"mask-position"(values: CssValue[][]): Command;
	}
}
