
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`mask-type`** CSS property sets whether an SVG `<mask>` element is used as a _luminance_ or an _alpha_ mask. It applies to the `<mask>` element itself.
		 * 
		 * **Initial value**: `luminance`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **24** | **35**  | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-type
		 */
		maskType(...values: CssValue[]): Command;
		/**
		 * The **`mask-type`** CSS property sets whether an SVG `<mask>` element is used as a _luminance_ or an _alpha_ mask. It applies to the `<mask>` element itself.
		 * 
		 * **Initial value**: `luminance`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **24** | **35**  | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-type
		 */
		maskType(...values: CssValue[][]): Command;
	}
}
