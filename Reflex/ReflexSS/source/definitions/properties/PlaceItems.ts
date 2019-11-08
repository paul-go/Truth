
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The CSS **`place-items`** shorthand property sets the `align-items` and `justify-items` properties, respectively. If the second value is not set, the first value is also used for it.
		 * 
		 * ---
		 * 
		 * _Supported in Flex Layout_
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **59** | **45**  | **11** |  No  | No  |
		 * 
		 * ---
		 * 
		 * _Supported in Grid Layout_
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **59** | **45**  | **11** |  No  | No  |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/place-items
		 */
		placeItems(...values: CssValue[]): Command;
		/**
		 * The CSS **`place-items`** shorthand property sets the `align-items` and `justify-items` properties, respectively. If the second value is not set, the first value is also used for it.
		 * 
		 * ---
		 * 
		 * _Supported in Flex Layout_
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **59** | **45**  | **11** |  No  | No  |
		 * 
		 * ---
		 * 
		 * _Supported in Grid Layout_
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **59** | **45**  | **11** |  No  | No  |
		 * 
		 * ---
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/place-items
		 */
		placeItems(...values: CssValue[][]): Command;
	}
}
