
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`padding-inline-start`** CSS property defines the logical inline start padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation. It corresponds to the `padding-top`, `padding-right`, `padding-bottom`, or `padding-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * |           Chrome            |         Firefox          |           Safari            | Edge | IE  |
		 * | :-------------------------: | :----------------------: | :-------------------------: | :--: | :-: |
		 * |           **69**            |          **41**          |          **12.1**           |  No  | No  |
		 * | 2 _(-webkit-padding-start)_ | 3 _(-moz-padding-start)_ | 3 _(-webkit-padding-start)_ |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/padding-inline-start
		 */
		paddingInlineStart(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`padding-inline-start`** CSS property defines the logical inline start padding of an element, which maps to a physical padding depending on the element's writing mode, directionality, and text orientation. It corresponds to the `padding-top`, `padding-right`, `padding-bottom`, or `padding-left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * |           Chrome            |         Firefox          |           Safari            | Edge | IE  |
		 * | :-------------------------: | :----------------------: | :-------------------------: | :--: | :-: |
		 * |           **69**            |          **41**          |          **12.1**           |  No  | No  |
		 * | 2 _(-webkit-padding-start)_ | 3 _(-moz-padding-start)_ | 3 _(-webkit-padding-start)_ |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/padding-inline-start
		 */
		paddingInlineStart(values: CssValue[][]): Command;
	}
}
