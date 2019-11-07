
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`break-before`** CSS property sets how page, column, or region breaks should behave before a generated box. If there is no generated box, the property is ignored.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * ---
		 * 
		 * _Supported in Multi-column Layout_
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **50** | **65**  |   No   | **12** | **10** |
		 * 
		 * ---
		 * 
		 * _Supported in Paged Media_
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **50** | **65**  | **10** | **12** | **10** |
		 * 
		 * ---
		 * 
		 * _Supported in CSS Regions_
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   |   No    |   No   |  No  | No  |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/break-before
		 */
		breakBefore(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`break-before`** CSS property sets how page, column, or region breaks should behave before a generated box. If there is no generated box, the property is ignored.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * ---
		 * 
		 * _Supported in Multi-column Layout_
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **50** | **65**  |   No   | **12** | **10** |
		 * 
		 * ---
		 * 
		 * _Supported in Paged Media_
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **50** | **65**  | **10** | **12** | **10** |
		 * 
		 * ---
		 * 
		 * _Supported in CSS Regions_
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   |   No    |   No   |  No  | No  |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/break-before
		 */
		breakBefore(values: CssValue[][]): Command;
	}
}
