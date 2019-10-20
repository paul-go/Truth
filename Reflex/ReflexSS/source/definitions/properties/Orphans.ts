
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`orphans`** CSS property sets the minimum number of lines in a block container that must be shown at the _bottom_ of a page, region, or column.
		 * 
		 * **Initial value**: `2`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **25** |   No    | **1.3** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/orphans
		 */
		orphans(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`orphans`** CSS property sets the minimum number of lines in a block container that must be shown at the _bottom_ of a page, region, or column.
		 * 
		 * **Initial value**: `2`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **25** |   No    | **1.3** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/orphans
		 */
		orphans(values: CssValue[][]): Call;
	}
}
