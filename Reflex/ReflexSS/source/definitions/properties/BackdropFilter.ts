
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`backdrop-filter`** CSS property lets you apply graphical effects such as blurring or color shifting to the area behind an element. Because it applies to everything _behind_ the element, to see the effect you must make the element or its background at least partially transparent.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |   Safari    |  Edge  | IE  |
		 * | :----: | :-----: | :---------: | :----: | :-: |
		 * | **76** |   n/a   | **9** _-x-_ | **17** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/backdrop-filter
		 */
		backdropFilter(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`backdrop-filter`** CSS property lets you apply graphical effects such as blurring or color shifting to the area behind an element. Because it applies to everything _behind_ the element, to see the effect you must make the element or its background at least partially transparent.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |   Safari    |  Edge  | IE  |
		 * | :----: | :-----: | :---------: | :----: | :-: |
		 * | **76** |   n/a   | **9** _-x-_ | **17** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/backdrop-filter
		 */
		backdropFilter(values: CssValue[][]): Command;
	}
}
