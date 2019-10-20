
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`gap`** CSS property sets the gaps (gutters) between rows and columns. It is a shorthand for `row-gap` and `column-gap`.
		 * 
		 * ---
		 * 
		 * _Supported in Flex Layout_
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **63**  |   No   |  No  | No  |
		 * 
		 * ---
		 * 
		 * _Supported in Grid Layout_
		 * 
		 * |     Chrome      |     Firefox     |        Safari         |  Edge  | IE  |
		 * | :-------------: | :-------------: | :-------------------: | :----: | :-: |
		 * |     **66**      |     **61**      | **10.1** _(grid-gap)_ | **16** | No  |
		 * | 57 _(grid-gap)_ | 52 _(grid-gap)_ |                       |        |     |
		 * 
		 * ---
		 * 
		 * _Supported in Multi-column Layout_
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **66** | **61**  |   No   | **16** | No  |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/gap
		 */
		gap(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`gap`** CSS property sets the gaps (gutters) between rows and columns. It is a shorthand for `row-gap` and `column-gap`.
		 * 
		 * ---
		 * 
		 * _Supported in Flex Layout_
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **63**  |   No   |  No  | No  |
		 * 
		 * ---
		 * 
		 * _Supported in Grid Layout_
		 * 
		 * |     Chrome      |     Firefox     |        Safari         |  Edge  | IE  |
		 * | :-------------: | :-------------: | :-------------------: | :----: | :-: |
		 * |     **66**      |     **61**      | **10.1** _(grid-gap)_ | **16** | No  |
		 * | 57 _(grid-gap)_ | 52 _(grid-gap)_ |                       |        |     |
		 * 
		 * ---
		 * 
		 * _Supported in Multi-column Layout_
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **66** | **61**  |   No   | **16** | No  |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/gap
		 */
		gap(values: CssValue[][]): Call;
	}
}
