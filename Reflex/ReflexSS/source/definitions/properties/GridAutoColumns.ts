
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`grid-auto-columns`** CSS property specifies the size of an implicitly-created grid column track.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox |  Safari  |          Edge           |             IE              |
		 * | :----: | :-----: | :------: | :---------------------: | :-------------------------: |
		 * | **57** | **70**  | **10.1** |         **16**          | **10** _(-ms-grid-columns)_ |
		 * |        |         |          | 12 _(-ms-grid-columns)_ |                             |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-columns
		 */
		gridAutoColumns(...values: CssValue[]): Command;
		/**
		 * The **`grid-auto-columns`** CSS property specifies the size of an implicitly-created grid column track.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox |  Safari  |          Edge           |             IE              |
		 * | :----: | :-----: | :------: | :---------------------: | :-------------------------: |
		 * | **57** | **70**  | **10.1** |         **16**          | **10** _(-ms-grid-columns)_ |
		 * |        |         |          | 12 _(-ms-grid-columns)_ |                             |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-columns
		 */
		gridAutoColumns(...values: CssValue[][]): Command;
	}
}
