
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`content`** CSS property replaces an element with a generated value. Objects inserted using the `content` property are _anonymous replaced elements._
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/content
		 */
		content(...values: CssValue[]): Command;
		/**
		 * The **`content`** CSS property replaces an element with a generated value. Objects inserted using the `content` property are _anonymous replaced elements._
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/content
		 */
		content(...values: CssValue[][]): Command;
	}
}
