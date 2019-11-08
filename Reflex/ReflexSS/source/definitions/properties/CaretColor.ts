
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`caret-color`** CSS property sets the color of the insertion caret, the visible marker where the next character typed will be inserted. The caret appears in elements such as `<input>` or those with the `contenteditable` attribute. The caret is typically a thin vertical line that flashes to help make it more noticeable. By default, it is black, but its color can be altered with this property.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **57** | **53**  | **11.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/caret-color
		 */
		caretColor(...values: CssValue[]): Command;
		/**
		 * The **`caret-color`** CSS property sets the color of the insertion caret, the visible marker where the next character typed will be inserted. The caret appears in elements such as `<input>` or those with the `contenteditable` attribute. The caret is typically a thin vertical line that flashes to help make it more noticeable. By default, it is black, but its color can be altered with this property.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **57** | **53**  | **11.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/caret-color
		 */
		caretColor(...values: CssValue[][]): Command;
	}
}
