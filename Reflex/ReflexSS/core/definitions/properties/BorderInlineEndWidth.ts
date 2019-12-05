
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-inline-end-width`** CSS property defines the width of the logical inline-end border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome |           Firefox           |  Safari  | Edge | IE  |
		 * | :----: | :-------------------------: | :------: | :--: | :-: |
		 * | **69** |           **41**            | **12.1** |  No  | No  |
		 * |        | 3 _(-moz-border-end-width)_ |          |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-width
		 */
		borderInlineEndWidth(...values: CssValue[]): Command;
		/**
		 * The **`border-inline-end-width`** CSS property defines the width of the logical inline-end border of an element, which maps to a physical border width depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-width`, `border-right-width`, `border-bottom-width`, or `border-left-width` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome |           Firefox           |  Safari  | Edge | IE  |
		 * | :----: | :-------------------------: | :------: | :--: | :-: |
		 * | **69** |           **41**            | **12.1** |  No  | No  |
		 * |        | 3 _(-moz-border-end-width)_ |          |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-width
		 */
		borderInlineEndWidth(...values: CssValue[][]): Command;
	}
}
