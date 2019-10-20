
declare namespace Reflex.SS
{
	export type Node = HTMLElement | Text;
	export type Branch = Rule | Call;
	export type Primitive = Core.Primitive<Node, Branch, string>;
	export type Primitives = Core.Primitives<Node, Branch, string>;
	
	/**
	 * Creates a namespace.
	 */
	export interface Namespace extends Core.IContainerNamespace<Primitives, string>
	{
		/**
		 * Temporary
		 */
		debug(): string;
		
		/**
		 * 
		 */
		emit(options: IEmitOptions): string;
	}
	
	/**
	 * Top-level value for all possible inputs
	 * to the CSS property creation functions.
	 */
	export type CssValue = string | number | Call | Unit;
}
