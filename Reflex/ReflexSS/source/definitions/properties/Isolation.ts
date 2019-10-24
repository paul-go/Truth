
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`isolation`** CSS property determines whether an element must create a new stacking context.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **41** | **36**  | **8**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/isolation
		 */
		isolation(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`isolation`** CSS property determines whether an element must create a new stacking context.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **41** | **36**  | **8**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/isolation
		 */
		isolation(values: CssValue[][]): Command;
	}
}
