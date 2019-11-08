
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-inline-color`** CSS property defines the color of the logical inline borders of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color` and `border-bottom-color`, or `border-right-color` and `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **69** | **66**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-color
		 */
		borderInlineColor(...values: CssValue[]): Command;
		/**
		 * The **`border-inline-color`** CSS property defines the color of the logical inline borders of an element, which maps to a physical border color depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-color` and `border-bottom-color`, or `border-right-color` and `border-left-color` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **69** | **66**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-inline-color
		 */
		borderInlineColor(...values: CssValue[][]): Command;
	}
}
