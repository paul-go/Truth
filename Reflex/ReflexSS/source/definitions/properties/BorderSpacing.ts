
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-spacing`** CSS property sets the distance between the borders of adjacent `<table>` cells. This property applies only when `border-collapse` is `separate`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-spacing
		 */
		borderSpacing(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-spacing`** CSS property sets the distance between the borders of adjacent `<table>` cells. This property applies only when `border-collapse` is `separate`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-spacing
		 */
		borderSpacing(values: CssValue[][]): Command;
		/**
		 * The **`border-spacing`** CSS property sets the distance between the borders of adjacent `<table>` cells. This property applies only when `border-collapse` is `separate`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-spacing
		 */
		"border-spacing"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-spacing`** CSS property sets the distance between the borders of adjacent `<table>` cells. This property applies only when `border-collapse` is `separate`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-spacing
		 */
		"border-spacing"(values: CssValue[][]): Command;
	}
}
