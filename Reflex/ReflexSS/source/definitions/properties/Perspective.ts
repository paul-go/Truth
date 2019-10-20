
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`perspective`** CSS property determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective. Each 3D element with z>0 becomes larger; each 3D-element with z<0 becomes smaller. The strength of the effect is determined by the value of this property.
		 * 
		 * **Initial value**: `none`
		 * 
		 * |  Chrome  | Firefox  | Safari  |  Edge  |   IE   |
		 * | :------: | :------: | :-----: | :----: | :----: |
		 * |  **36**  |  **16**  |  **9**  | **12** | **10** |
		 * | 12 _-x-_ | 10 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/perspective
		 */
		perspective(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`perspective`** CSS property determines the distance between the z=0 plane and the user in order to give a 3D-positioned element some perspective. Each 3D element with z>0 becomes larger; each 3D-element with z<0 becomes smaller. The strength of the effect is determined by the value of this property.
		 * 
		 * **Initial value**: `none`
		 * 
		 * |  Chrome  | Firefox  | Safari  |  Edge  |   IE   |
		 * | :------: | :------: | :-----: | :----: | :----: |
		 * |  **36**  |  **16**  |  **9**  | **12** | **10** |
		 * | 12 _-x-_ | 10 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/perspective
		 */
		perspective(values: CssValue[][]): Call;
	}
}
