
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`object-position`** CSS property specifies the alignment of the selected replaced element's contents within the element's box. Areas of the box which aren't covered by the replaced element's object will show the element's background.
		 * 
		 * **Initial value**: `50% 50%`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **31** | **36**  | **10** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/object-position
		 */
		objectPosition(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`object-position`** CSS property specifies the alignment of the selected replaced element's contents within the element's box. Areas of the box which aren't covered by the replaced element's object will show the element's background.
		 * 
		 * **Initial value**: `50% 50%`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **31** | **36**  | **10** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/object-position
		 */
		objectPosition(values: CssValue[][]): Command;
	}
}
