
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-emphasis`** CSS property applies emphasis marks to text (except spaces and control characters). It is a shorthand for `text-emphasis-style` and `text-emphasis-color`.
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **25** | **46**  | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis
		 */
		textEmphasis(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-emphasis`** CSS property applies emphasis marks to text (except spaces and control characters). It is a shorthand for `text-emphasis-style` and `text-emphasis-color`.
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **25** | **46**  | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis
		 */
		textEmphasis(values: CssValue[][]): Command;
		/**
		 * The **`text-emphasis`** CSS property applies emphasis marks to text (except spaces and control characters). It is a shorthand for `text-emphasis-style` and `text-emphasis-color`.
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **25** | **46**  | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis
		 */
		"text-emphasis"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-emphasis`** CSS property applies emphasis marks to text (except spaces and control characters). It is a shorthand for `text-emphasis-style` and `text-emphasis-color`.
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **25** | **46**  | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis
		 */
		"text-emphasis"(values: CssValue[][]): Command;
	}
}
