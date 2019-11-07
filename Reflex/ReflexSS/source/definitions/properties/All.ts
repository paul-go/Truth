
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The `**all**` CSS shorthand property sets all of an element's properties (other than `unicode-bidi` and `direction`) to their initial or inherited values, or to the values specified in another stylesheet origin.
		 * 
		 * **Initial value**: There is no practical initial value for it.
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **37** | **27**  | **9.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/all
		 */
		all(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The `**all**` CSS shorthand property sets all of an element's properties (other than `unicode-bidi` and `direction`) to their initial or inherited values, or to the values specified in another stylesheet origin.
		 * 
		 * **Initial value**: There is no practical initial value for it.
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **37** | **27**  | **9.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/all
		 */
		all(values: CssValue[][]): Command;
	}
}
