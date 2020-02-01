
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`scroll-snap-type`** CSS property sets how strictly snap points are enforced on the scroll container in case there is one.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari  |     Edge     |      IE      |
		 * | :----: | :-----: | :-----: | :----------: | :----------: |
		 * | **69** |  39-68  | **11**  | **12** _-x-_ | **10** _-x-_ |
		 * |        |         | 9 _-x-_ |              |              |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type
		 */
		scrollSnapType(...values: CssValue[]): Command;
		/**
		 * The **`scroll-snap-type`** CSS property sets how strictly snap points are enforced on the scroll container in case there is one.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari  |     Edge     |      IE      |
		 * | :----: | :-----: | :-----: | :----------: | :----------: |
		 * | **69** |  39-68  | **11**  | **12** _-x-_ | **10** _-x-_ |
		 * |        |         | 9 _-x-_ |              |              |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/scroll-snap-type
		 */
		scrollSnapType(...values: CssValue[][]): Command;
	}
}
