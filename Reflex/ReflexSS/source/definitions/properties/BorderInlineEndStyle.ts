
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-inline-end-style`** CSS property defines the style of the logical inline end border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome |           Firefox           |  Safari  | Edge | IE  |
		 * | :----: | :-------------------------: | :------: | :--: | :-: |
		 * | **69** |           **41**            | **12.1** |  No  | No  |
		 * |        | 3 _(-moz-border-end-style)_ |          |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-style
		 */
		borderInlineEndStyle(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-inline-end-style`** CSS property defines the style of the logical inline end border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome |           Firefox           |  Safari  | Edge | IE  |
		 * | :----: | :-------------------------: | :------: | :--: | :-: |
		 * | **69** |           **41**            | **12.1** |  No  | No  |
		 * |        | 3 _(-moz-border-end-style)_ |          |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-style
		 */
		borderInlineEndStyle(values: CssValue[][]): Command;
	}
}
