
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-inline-end-color`** CSS property defines the color of the logical inline-end border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome |           Firefox           |  Safari  | Edge | IE  |
		 * | :----: | :-------------------------: | :------: | :--: | :-: |
		 * | **69** |           **41**            | **12.1** |  No  | No  |
		 * |        | 3 _(-moz-border-end-color)_ |          |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-color
		 */
		borderInlineEndColor(...values: CssValue[]): Command;
		/**
		 * The **`border-inline-end-color`** CSS property defines the color of the logical inline-end border of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color`, `border-right-color`, `border-bottom-color`, or `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome |           Firefox           |  Safari  | Edge | IE  |
		 * | :----: | :-------------------------: | :------: | :--: | :-: |
		 * | **69** |           **41**            | **12.1** |  No  | No  |
		 * |        | 3 _(-moz-border-end-color)_ |          |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-end-color
		 */
		borderInlineEndColor(...values: CssValue[][]): Command;
	}
}
