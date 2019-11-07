
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`transform-box`** CSS property defines the layout box to which the `transform` and `transform-origin` properties relate.
		 * 
		 * **Initial value**: `border-box `
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **64** | **55**  | **11** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transform-box
		 */
		transformBox(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`transform-box`** CSS property defines the layout box to which the `transform` and `transform-origin` properties relate.
		 * 
		 * **Initial value**: `border-box `
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **64** | **55**  | **11** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transform-box
		 */
		transformBox(values: CssValue[][]): Command;
	}
}
