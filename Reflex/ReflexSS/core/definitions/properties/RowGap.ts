
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`row-gap`** CSS property sets the size of the gap (gutter) between an element's grid rows.
		 * 
		 * **Initial value**: `normal`
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
		 * |       Chrome        |       Firefox       |          Safari           |  Edge  | IE  |
		 * | :-----------------: | :-----------------: | :-----------------------: | :----: | :-: |
		 * |       **66**        |       **61**        | **10.1** _(grid-row-gap)_ | **16** | No  |
		 * | 57 _(grid-row-gap)_ | 52 _(grid-row-gap)_ |                           |        |     |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/row-gap
		 */
		rowGap(...values: CssValue[]): Command;
		/**
		 * The **`row-gap`** CSS property sets the size of the gap (gutter) between an element's grid rows.
		 * 
		 * **Initial value**: `normal`
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
		 * |       Chrome        |       Firefox       |          Safari           |  Edge  | IE  |
		 * | :-----------------: | :-----------------: | :-----------------------: | :----: | :-: |
		 * |       **66**        |       **61**        | **10.1** _(grid-row-gap)_ | **16** | No  |
		 * | 57 _(grid-row-gap)_ | 52 _(grid-row-gap)_ |                           |        |     |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/row-gap
		 */
		rowGap(...values: CssValue[][]): Command;
	}
}
