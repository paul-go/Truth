
namespace Reflex.SS
{
	/**
	 * Specifies the options for the .emit() function.
	 */
	export interface IEmitOptions
	{
		/**
		 * Specifies whether the CSS should be emitted as inline
		 * text in the form "property1: value; property2: value", suitable
		 * for assignment to the .cssText field in the style attribute
		 * of HTMLElement objects.
		 * 
		 * When set to true, only the declarations in the top-level rule
		 * are emitted. Nested rules and directive blocks are ignored.
		 */
		inline?: boolean;
		
		/**
		 * Specifies whether the CSS should be emitted in a readable
		 * format. If unspecified, the value is assumed to be true.
		 */
		format?: boolean;
		
		/**
		 * @internal
		 * Stores the string to use for indents.
		 */
		indent?: string;
		
		/**
		 * @internal
		 * Stores the string to use for newlines.
		 */
		line?: string;
	}
	
	/**
	 * @internal
	 */
	export function fillOptions(options?: IEmitOptions)
	{
		const opt = <Defined<IEmitOptions>>options || {};
		opt.inline = !!opt.inline;
		opt.format = opt.format === undefined ? true : !!opt.format;
		opt.indent = opt.indent || (opt.format ? "\t" : "");
		opt.line = opt.line || (opt.format ? "\n" : "");
		return opt;
	}
	
	/** */
	type Defined<T> = { [P in keyof T]-?: T[P] };
}
