
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`unicode-bidi`** CSS property, together with the `direction` property, determines how bidirectional text in a document is handled. For example, if a block of content contains both left-to-right and right-to-left text, the user-agent uses a complex Unicode algorithm to decide how to display the text. The `unicode-bidi` property overrides this algorithm and allows the developer to control the text embedding.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |   IE    |
		 * | :----: | :-----: | :-----: | :----: | :-----: |
		 * | **2**  |  **1**  | **1.3** | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/unicode-bidi
		 */
		unicodeBidi(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`unicode-bidi`** CSS property, together with the `direction` property, determines how bidirectional text in a document is handled. For example, if a block of content contains both left-to-right and right-to-left text, the user-agent uses a complex Unicode algorithm to decide how to display the text. The `unicode-bidi` property overrides this algorithm and allows the developer to control the text embedding.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |   IE    |
		 * | :----: | :-----: | :-----: | :----: | :-----: |
		 * | **2**  |  **1**  | **1.3** | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/unicode-bidi
		 */
		unicodeBidi(values: CssValue[][]): Call;
		/**
		 * The **`unicode-bidi`** CSS property, together with the `direction` property, determines how bidirectional text in a document is handled. For example, if a block of content contains both left-to-right and right-to-left text, the user-agent uses a complex Unicode algorithm to decide how to display the text. The `unicode-bidi` property overrides this algorithm and allows the developer to control the text embedding.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |   IE    |
		 * | :----: | :-----: | :-----: | :----: | :-----: |
		 * | **2**  |  **1**  | **1.3** | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/unicode-bidi
		 */
		"unicode-bidi"(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`unicode-bidi`** CSS property, together with the `direction` property, determines how bidirectional text in a document is handled. For example, if a block of content contains both left-to-right and right-to-left text, the user-agent uses a complex Unicode algorithm to decide how to display the text. The `unicode-bidi` property overrides this algorithm and allows the developer to control the text embedding.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |   IE    |
		 * | :----: | :-----: | :-----: | :----: | :-----: |
		 * | **2**  |  **1**  | **1.3** | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/unicode-bidi
		 */
		"unicode-bidi"(values: CssValue[][]): Call;
	}
}
