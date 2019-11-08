
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`inset-inline-end`** CSS property defines the logical inline end inset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |  n/a   | **63**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/inset-inline-end
		 */
		insetInlineEnd(...values: CssValue[]): Command;
		/**
		 * The **`inset-inline-end`** CSS property defines the logical inline end inset of an element, which maps to a physical inset depending on the element's writing mode, directionality, and text orientation. It corresponds to the `top`, `right`, `bottom`, or `left` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |  n/a   | **63**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/inset-inline-end
		 */
		insetInlineEnd(...values: CssValue[][]): Command;
	}
}
