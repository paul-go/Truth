
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
		//# Utilities
		
		/** Temporary. */
		debug(): string;
		
		/**
		 * 
		 */
		emit(options: IEmitOptions): string;
		
		//# CSS property generators
		
		/** Text align property. */
		textAlign(value: "left" | "center" | "right"): Call;
		
		/** Text indent property. */
		textIndent(value: Unit): Call;
		
		/** */
		width(value: Calc | Unit | "auto" | "fit-content" | "max-content"): Call;
		
		/** */
		backgroundImage(url: Url): Call;
		backgroundImage(...urls: Url[][]): Call;
		
		//# CSS functions
		
		/** */
		calc(lhs: Unit, operator: "+" | "-" | "*" | "/", rhs: Unit): Calc;
		
		/** */
		url(urlText: string): Url;
	}
	
	export interface Url extends Call { readonly callingName: "url"; }
	export interface Calc extends Call { readonly callingName: "calc"; }
}
