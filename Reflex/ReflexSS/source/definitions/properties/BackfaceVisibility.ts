
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`backface-visibility`** CSS property sets whether the back face of an element is visible when turned towards the user.
		 * 
		 * **Initial value**: `visible`
		 * 
		 * |  Chrome  | Firefox  |    Safari     |  Edge  |   IE   |
		 * | :------: | :------: | :-----------: | :----: | :----: |
		 * |  **36**  |  **16**  | **5.1** _-x-_ | **12** | **10** |
		 * | 12 _-x-_ | 10 _-x-_ |               |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/backface-visibility
		 */
		backfaceVisibility(...values: CssValue[]): Command;
		/**
		 * The **`backface-visibility`** CSS property sets whether the back face of an element is visible when turned towards the user.
		 * 
		 * **Initial value**: `visible`
		 * 
		 * |  Chrome  | Firefox  |    Safari     |  Edge  |   IE   |
		 * | :------: | :------: | :-----------: | :----: | :----: |
		 * |  **36**  |  **16**  | **5.1** _-x-_ | **12** | **10** |
		 * | 12 _-x-_ | 10 _-x-_ |               |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/backface-visibility
		 */
		backfaceVisibility(...values: CssValue[][]): Command;
	}
}
