
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The `**max-block-size**` CSS property specifies the maximum size of an element in the direction opposite that of the writing direction as specified by `writing-mode`. That is, if the writing direction is horizontal, then `max-block-size` is equivalent to `max-height`; if the writing direction is vertical, `max-block-size` is the same as `max-width`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **57** | **41**  | **12.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/max-block-size
		 */
		maxBlockSize(...values: CssValue[]): Command;
		/**
		 * The `**max-block-size**` CSS property specifies the maximum size of an element in the direction opposite that of the writing direction as specified by `writing-mode`. That is, if the writing direction is horizontal, then `max-block-size` is equivalent to `max-height`; if the writing direction is vertical, `max-block-size` is the same as `max-width`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **57** | **41**  | **12.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/max-block-size
		 */
		maxBlockSize(...values: CssValue[][]): Command;
	}
}
