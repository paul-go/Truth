
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-block-end-style`** CSS property defines the style of the logical block end border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **69** | **41**  | **12.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-block-end-style
		 */
		borderBlockEndStyle(...values: CssValue[]): Command;
		/**
		 * The **`border-block-end-style`** CSS property defines the style of the logical block end border of an element, which maps to a physical border style depending on the element's writing mode, directionality, and text orientation. It corresponds to the `border-top-style`, `border-right-style`, `border-bottom-style`, or `border-left-style` property depending on the values defined for `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **69** | **41**  | **12.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-block-end-style
		 */
		borderBlockEndStyle(...values: CssValue[][]): Command;
	}
}
