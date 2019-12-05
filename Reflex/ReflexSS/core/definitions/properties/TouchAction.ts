
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`touch-action`** CSS property sets how a region can be manipulated by a touchscreen user (for example, by zooming features built into the browser).
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |    IE    |
		 * | :----: | :-----: | :----: | :----: | :------: |
		 * | **36** | **52**  | **13** | **12** |  **11**  |
		 * |        |         |        |        | 10 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/touch-action
		 */
		touchAction(...values: CssValue[]): Command;
		/**
		 * The **`touch-action`** CSS property sets how a region can be manipulated by a touchscreen user (for example, by zooming features built into the browser).
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |    IE    |
		 * | :----: | :-----: | :----: | :----: | :------: |
		 * | **36** | **52**  | **13** | **12** |  **11**  |
		 * |        |         |        |        | 10 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/touch-action
		 */
		touchAction(...values: CssValue[][]): Command;
	}
}
