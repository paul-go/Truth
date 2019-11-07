
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`column-gap`** CSS property sets the size of the gap (gutter) between an element's columns.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * ---
		 * 
		 * _Supported in Flex Layout_
		 * 
		 * | Chrome | Firefox |   Safari    | Edge | IE  |
		 * | :----: | :-----: | :---------: | :--: | :-: |
		 * |   No   | **63**  | **3** _-x-_ |  No  | No  |
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
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **52**   | **10**  | **12** | **10** |
		 * | 1 _-x-_ | 1.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-gap
		 */
		columnGap(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`column-gap`** CSS property sets the size of the gap (gutter) between an element's columns.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * ---
		 * 
		 * _Supported in Flex Layout_
		 * 
		 * | Chrome | Firefox |   Safari    | Edge | IE  |
		 * | :----: | :-----: | :---------: | :--: | :-: |
		 * |   No   | **63**  | **3** _-x-_ |  No  | No  |
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
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **52**   | **10**  | **12** | **10** |
		 * | 1 _-x-_ | 1.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-gap
		 */
		columnGap(values: CssValue[][]): Command;
	}
}
