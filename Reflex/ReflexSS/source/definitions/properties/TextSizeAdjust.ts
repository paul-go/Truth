
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-size-adjust`** CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
		 * 
		 * **Initial value**: `auto` for smartphone browsers supporting inflation, `none` in other cases (and then not modifiable).
		 * 
		 * | Chrome | Firefox | Safari |     Edge     | IE  |
		 * | :----: | :-----: | :----: | :----------: | :-: |
		 * | **54** |   No    |   No   | **12** _-x-_ | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-size-adjust
		 */
		textSizeAdjust(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-size-adjust`** CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
		 * 
		 * **Initial value**: `auto` for smartphone browsers supporting inflation, `none` in other cases (and then not modifiable).
		 * 
		 * | Chrome | Firefox | Safari |     Edge     | IE  |
		 * | :----: | :-----: | :----: | :----------: | :-: |
		 * | **54** |   No    |   No   | **12** _-x-_ | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-size-adjust
		 */
		textSizeAdjust(values: CssValue[][]): Command;
		/**
		 * The **`text-size-adjust`** CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
		 * 
		 * **Initial value**: `auto` for smartphone browsers supporting inflation, `none` in other cases (and then not modifiable).
		 * 
		 * | Chrome | Firefox | Safari |     Edge     | IE  |
		 * | :----: | :-----: | :----: | :----------: | :-: |
		 * | **54** |   No    |   No   | **12** _-x-_ | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-size-adjust
		 */
		"text-size-adjust"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-size-adjust`** CSS property controls the text inflation algorithm used on some smartphones and tablets. Other browsers will ignore this property.
		 * 
		 * **Initial value**: `auto` for smartphone browsers supporting inflation, `none` in other cases (and then not modifiable).
		 * 
		 * | Chrome | Firefox | Safari |     Edge     | IE  |
		 * | :----: | :-----: | :----: | :----------: | :-: |
		 * | **54** |   No    |   No   | **12** _-x-_ | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-size-adjust
		 */
		"text-size-adjust"(values: CssValue[][]): Command;
	}
}
