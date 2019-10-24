
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`will-change`** CSS property hints to browsers how an element is expected to change. Browsers may set up optimizations before an element is actually changed. These kinds of optimizations can increase the responsiveness of a page by doing potentially expensive work before they are actually required.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **36** | **36**  | **9.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/will-change
		 */
		willChange(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`will-change`** CSS property hints to browsers how an element is expected to change. Browsers may set up optimizations before an element is actually changed. These kinds of optimizations can increase the responsiveness of a page by doing potentially expensive work before they are actually required.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **36** | **36**  | **9.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/will-change
		 */
		willChange(values: CssValue[][]): Command;
		/**
		 * The **`will-change`** CSS property hints to browsers how an element is expected to change. Browsers may set up optimizations before an element is actually changed. These kinds of optimizations can increase the responsiveness of a page by doing potentially expensive work before they are actually required.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **36** | **36**  | **9.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/will-change
		 */
		"will-change"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`will-change`** CSS property hints to browsers how an element is expected to change. Browsers may set up optimizations before an element is actually changed. These kinds of optimizations can increase the responsiveness of a page by doing potentially expensive work before they are actually required.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **36** | **36**  | **9.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/will-change
		 */
		"will-change"(values: CssValue[][]): Command;
	}
}
