
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`grid-auto-rows`** CSS property specifies the size of an implicitly-created grid row track.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox |  Safari  |         Edge         |            IE            |
		 * | :----: | :-----: | :------: | :------------------: | :----------------------: |
		 * | **57** | **70**  | **10.1** |        **16**        | **10** _(-ms-grid-rows)_ |
		 * |        |         |          | 12 _(-ms-grid-rows)_ |                          |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-rows
		 */
		gridAutoRows(...values: CssValue[]): Command;
		/**
		 * The **`grid-auto-rows`** CSS property specifies the size of an implicitly-created grid row track.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox |  Safari  |         Edge         |            IE            |
		 * | :----: | :-----: | :------: | :------------------: | :----------------------: |
		 * | **57** | **70**  | **10.1** |        **16**        | **10** _(-ms-grid-rows)_ |
		 * |        |         |          | 12 _(-ms-grid-rows)_ |                          |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-rows
		 */
		gridAutoRows(...values: CssValue[][]): Command;
	}
}
