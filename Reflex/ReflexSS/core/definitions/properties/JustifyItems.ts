
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The CSS **`justify-items`** property defines the default `justify-self` for all items of the box, giving them all a default way of justifying each box along the appropriate axis.
		 * 
		 * **Initial value**: `legacy`
		 * 
		 * ---
		 * 
		 * _Supported in Flex Layout_
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **52** | **20**  | **9**  | **12** | **11** |
		 * 
		 * ---
		 * 
		 * _Supported in Grid Layout_
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **45**  | **10.1** | **16** | No  |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/justify-items
		 */
		justifyItems(...values: CssValue[]): Command;
		/**
		 * The CSS **`justify-items`** property defines the default `justify-self` for all items of the box, giving them all a default way of justifying each box along the appropriate axis.
		 * 
		 * **Initial value**: `legacy`
		 * 
		 * ---
		 * 
		 * _Supported in Flex Layout_
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **52** | **20**  | **9**  | **12** | **11** |
		 * 
		 * ---
		 * 
		 * _Supported in Grid Layout_
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **45**  | **10.1** | **16** | No  |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/justify-items
		 */
		justifyItems(...values: CssValue[][]): Command;
	}
}
