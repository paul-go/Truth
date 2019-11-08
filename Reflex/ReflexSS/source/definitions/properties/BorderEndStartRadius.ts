
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-end-start-radius`** CSS property defines a logical border radius on an element, which maps to a physical border radius depending on the element's `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **66**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-end-start-radius
		 */
		borderEndStartRadius(...values: CssValue[]): Command;
		/**
		 * The **`border-end-start-radius`** CSS property defines a logical border radius on an element, which maps to a physical border radius depending on the element's `writing-mode`, `direction`, and `text-orientation`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **66**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-end-start-radius
		 */
		borderEndStartRadius(...values: CssValue[][]): Command;
	}
}
