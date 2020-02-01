
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`animation-play-state`** CSS property sets whether an animation is running or paused.
		 * 
		 * **Initial value**: `running`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-play-state
		 */
		animationPlayState(...values: CssValue[]): Command;
		/**
		 * The **`animation-play-state`** CSS property sets whether an animation is running or paused.
		 * 
		 * **Initial value**: `running`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-play-state
		 */
		animationPlayState(...values: CssValue[][]): Command;
	}
}
