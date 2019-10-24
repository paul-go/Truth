
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`object-fit`** CSS property sets how the content of a replaced element, such as an `<img>` or `<video>`, should be resized to fit its container.
		 * 
		 * **Initial value**: `fill`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **31** | **36**  | **10** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/object-fit
		 */
		objectFit(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`object-fit`** CSS property sets how the content of a replaced element, such as an `<img>` or `<video>`, should be resized to fit its container.
		 * 
		 * **Initial value**: `fill`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **31** | **36**  | **10** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/object-fit
		 */
		objectFit(values: CssValue[][]): Command;
		/**
		 * The **`object-fit`** CSS property sets how the content of a replaced element, such as an `<img>` or `<video>`, should be resized to fit its container.
		 * 
		 * **Initial value**: `fill`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **31** | **36**  | **10** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/object-fit
		 */
		"object-fit"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`object-fit`** CSS property sets how the content of a replaced element, such as an `<img>` or `<video>`, should be resized to fit its container.
		 * 
		 * **Initial value**: `fill`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **31** | **36**  | **10** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/object-fit
		 */
		"object-fit"(values: CssValue[][]): Command;
	}
}
