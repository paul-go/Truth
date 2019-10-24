
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`pointer-events`** CSS property sets under what circumstances (if any) a particular graphic element can become the target of mouse events.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **1**  | **1.5** | **4**  | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/pointer-events
		 */
		pointerEvents(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`pointer-events`** CSS property sets under what circumstances (if any) a particular graphic element can become the target of mouse events.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **1**  | **1.5** | **4**  | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/pointer-events
		 */
		pointerEvents(values: CssValue[][]): Command;
		/**
		 * The **`pointer-events`** CSS property sets under what circumstances (if any) a particular graphic element can become the target of mouse events.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **1**  | **1.5** | **4**  | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/pointer-events
		 */
		"pointer-events"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`pointer-events`** CSS property sets under what circumstances (if any) a particular graphic element can become the target of mouse events.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **1**  | **1.5** | **4**  | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/pointer-events
		 */
		"pointer-events"(values: CssValue[][]): Command;
	}
}
