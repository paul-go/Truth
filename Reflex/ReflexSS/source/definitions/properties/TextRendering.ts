
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-rendering`** CSS property provides information to the rendering engine about what to optimize for when rendering text.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **4**  |  **1**  | **5**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-rendering
		 */
		textRendering(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-rendering`** CSS property provides information to the rendering engine about what to optimize for when rendering text.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **4**  |  **1**  | **5**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-rendering
		 */
		textRendering(values: CssValue[][]): Command;
		/**
		 * The **`text-rendering`** CSS property provides information to the rendering engine about what to optimize for when rendering text.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **4**  |  **1**  | **5**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-rendering
		 */
		"text-rendering"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-rendering`** CSS property provides information to the rendering engine about what to optimize for when rendering text.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **4**  |  **1**  | **5**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-rendering
		 */
		"text-rendering"(values: CssValue[][]): Command;
	}
}
