
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`transform`** CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE    |
		 * | :-----: | :-----: | :-------: | :----: | :-----: |
		 * | **36**  | **16**  |   **9**   | **12** | **10**  |
		 * | 1 _-x-_ |         | 3.1 _-x-_ |        | 9 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transform
		 */
		transform(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`transform`** CSS property lets you rotate, scale, skew, or translate an element. It modifies the coordinate space of the CSS visual formatting model.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE    |
		 * | :-----: | :-----: | :-------: | :----: | :-----: |
		 * | **36**  | **16**  |   **9**   | **12** | **10**  |
		 * | 1 _-x-_ |         | 3.1 _-x-_ |        | 9 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transform
		 */
		transform(values: CssValue[][]): Call;
	}
}
