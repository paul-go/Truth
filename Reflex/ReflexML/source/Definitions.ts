
//# on() function declarations

/**
 * 
 */
declare function on<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Primitives,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	forces: (() => void) | (() => void)[],
	callback: (e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on<A1>(
	forces: ((a1: A1) => void) | ((a1: A1) => void)[],
	callback: (a1: A1, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1]>;

/**
 * 
 */
declare function on<A1, A2>(
	forces: ((a1: A1, a2: A2) => void) | ((a1: A1, a2: A2) => void)[],
	callback: (a1: A1, a2: A2, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2]>;

/**
 * 
 */
declare function on<A1, A2, A3>(
	forces: ((a1: A1, a2: A2, a3: A3) => void) | ((a1: A1, a2: A2, a3: A3) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3]>;

/**
 * 
 */
declare function on<A1, A2, A3, A4>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3, A4]>;

/**
 * 
 */
declare function on<A1, A2, A3, A4, A5>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3, A4, A5]>;

/**
 * 
 */
declare function on<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on<T>(
	array: Reflex.Core.ArrayForce<T>,
	renderFn: (item: T, e: HTMLElement, index: number) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.content,
	callback: (
		kind: Reflex.mutation.contentAdd | Reflex.mutation.contentRemove,
		text: Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.contentAdd,
	callback: (text: Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.contentRemove,
	callback: (text: Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * Wraps a function that executes during restoration.
 */
declare function on<A extends any[]>(
	callback: (e: HTMLElement, ...args: A) => Reflex.ML.Primitives,
	...args: A
): Reflex.Core.Recurrent;

//# once() function declarations

/**
 * 
 */
declare function once<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Primitives,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	forces: (() => void) | (() => void)[],
	callback: (e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once<A1>(
	forces: ((a1: A1) => void) | ((a1: A1) => void)[],
	callback: (a1: A1, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1]>;

/**
 * 
 */
declare function once<A1, A2>(
	forces: ((a1: A1, a2: A2) => void) | ((a1: A1, a2: A2) => void)[],
	callback: (a1: A1, a2: A2, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2]>;

/**
 * 
 */
declare function once<A1, A2, A3>(
	forces: ((a1: A1, a2: A2, a3: A3) => void) | ((a1: A1, a2: A2, a3: A3) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3]>;

/**
 * 
 */
declare function once<A1, A2, A3, A4>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3, A4]>;

/**
 * 
 */
declare function once<A1, A2, A3, A4, A5>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3, A4, A5]>;

/**
 * 
 */
declare function once<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once<T>(
	forces: Reflex.Core.ArrayForce<T>,
	renderFn: (item: T) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.content,
	callback: (
		kind: Reflex.mutation.contentAdd | Reflex.mutation.contentRemove,
		text: Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.contentAdd,
	callback: (text: Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.contentRemove,
	callback: (text: Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

//# only() function declarations

/**
 * 
 */
declare function only<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Primitives,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only<A extends any[]>(
	forces: (...args: A) => void,
	callback: (...args: A) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<A>;

/**
 * 
 */
declare function only<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.content,
	callback: (
		kind: Reflex.mutation.contentAdd | Reflex.mutation.contentRemove,
		text: Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.contentAdd,
	callback: (text: Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.contentRemove,
	callback: (text: Text) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * Removes all event handlers from the specified element.
 */
declare function off(e: HTMLElement): void;

/**
 * Removes the specified event handler from the specified element.
 */
declare function off(e: HTMLElement, callback: (...args: any[]) => any): void;

/**
 * 
 */
declare function attach(...primitives: Reflex.ML.Primitives[]): { 
	to: (target: Reflex.ML.Branch) => void;
};

declare namespace Reflex.ML
{
	export type Node = HTMLElement | Text;
	export type Branch = HTMLElement;
	export type Primitive = Core.Primitive<Node, Branch, string>;
	export type Primitives = Core.Primitives<Node, Branch, string>;
	
	export interface Namespace extends Core.IContentNamespace
		<Text, Text | string | number | bigint>
	{
		//# Static Members
		
		/**
		 * Causes the connected HTMLElement to be data-bound to the
		 * specified Force.
		 * 
		 * Uses the Force's .value property when connected to an
		 * HTMLInputElement, otherwise, the .textContent property is used.
		 */
		bind<T extends string | number | bigint>(statefulForce: Reflex.Core.StatefulForce<T>): void;
		
		//# HTML Elements
		
		/** Callable property that returns an <a> element with the primitives applied. */
		readonly a: ((...primitives: Primitives[]) => HTMLAnchorElement) &
			Reflex.Core.BranchFunction<"a">;
		
		/** Callable property that returns an <abbr> element with the primitives applied. */
		readonly abbr: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"abbr">;
		
		/** Callable property that returns an <address> element with the primitives applied. */
		readonly address: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"address">;
		
		/** Callable property that returns an <area> element with the primitives applied. */
		readonly area: ((...primitives: Primitives[]) => HTMLAreaElement) &
			Reflex.Core.BranchFunction<"area">;
		
		/** Callable property that returns an <article> element with the primitives applied. */
		readonly article: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"article">;
		
		/** Callable property that returns an <aside> element with the primitives applied. */
		readonly aside: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"aside">;
		
		/** Callable property that returns an <audio> element with the primitives applied. */
		readonly audio: ((...primitives: Primitives[]) => HTMLAudioElement) &
			Reflex.Core.BranchFunction<"audio">;
		
		/** Callable property that returns a <b> element with the primitives applied. */
		readonly b: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"b">;
		
		/** Callable property that returns a <bdi> element with the primitives applied. */
		readonly bdi: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"bdi">;
		
		/** Callable property that returns a <bdo> element with the primitives applied. */
		readonly bdo: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"bdo">;
		
		/** Callable property that returns a <blockquote> element with the primitives applied. */
		readonly blockquote: ((...primitives: Primitives[]) => HTMLQuoteElement) &
			Reflex.Core.BranchFunction<"blockquote">;
		
		/** Callable property that returns a <br> element with the primitives applied. */
		readonly br: ((...primitives: Primitives[]) => HTMLBRElement) &
			Reflex.Core.BranchFunction<"br">;
		
		/** Callable property that returns a <button> element with the primitives applied. */
		readonly button: ((...primitives: Primitives[]) => HTMLButtonElement) &
			Reflex.Core.BranchFunction<"button">;
		
		/** Callable property that returns a <canvas> element with the primitives applied. */
		readonly canvas: ((...primitives: Primitives[]) => HTMLCanvasElement) &
			Reflex.Core.BranchFunction<"canvas">;
		
		/** Callable property that returns a <caption> element with the primitives applied. */
		readonly caption: ((...primitives: Primitives[]) => HTMLTableCaptionElement) &
			Reflex.Core.BranchFunction<"caption">;
		
		/** Callable property that returns a <cite> element with the primitives applied. */
		readonly cite: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"cite">;
		
		/** Callable property that returns a <code> element with the primitives applied. */
		readonly code: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"code">;
		
		/** Callable property that returns a <col> element with the primitives applied. */
		readonly col: ((...primitives: Primitives[]) => HTMLTableColElement) &
			Reflex.Core.BranchFunction<"col">;
		
		/** Callable property that returns a <colgroup> element with the primitives applied. */
		readonly colgroup: ((...primitives: Primitives[]) => HTMLTableColElement) &
			Reflex.Core.BranchFunction<"colgroup">;
		
		/** Callable property that returns a <data> element with the primitives applied. */
		readonly data: ((...primitives: Primitives[]) => HTMLDataElement) &
			Reflex.Core.BranchFunction<"data">;
		
		/** Callable property that returns a <datalist> element with the primitives applied. */
		readonly datalist: ((...primitives: Primitives[]) => HTMLDataListElement) &
			Reflex.Core.BranchFunction<"datalist">;
		
		/** Callable property that returns a <dd> element with the primitives applied. */
		readonly dd: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dd">;
		
		/** Callable property that returns a <del> element with the primitives applied. */
		readonly del: ((...primitives: Primitives[]) => HTMLModElement) &
			Reflex.Core.BranchFunction<"del">;
		
		/** Callable property that returns a <details> element with the primitives applied. */
		readonly details: ((...primitives: Primitives[]) => HTMLDetailsElement) &
			Reflex.Core.BranchFunction<"details">;
		
		/** Callable property that returns a <dfn> element with the primitives applied. */
		readonly dfn: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dfn">;
		
		/** Callable property that returns a <dir> element with the primitives applied. */
		readonly dir: ((...primitives: Primitives[]) => HTMLDirectoryElement) &
			Reflex.Core.BranchFunction<"dir">;
		
		/** Callable property that returns a <div> element with the primitives applied. */
		readonly div: ((...primitives: Primitives[]) => HTMLDivElement) &
			Reflex.Core.BranchFunction<"div">;
		
		/** Callable property that returns a <dl> element with the primitives applied. */
		readonly dl: ((...primitives: Primitives[]) => HTMLDListElement) &
			Reflex.Core.BranchFunction<"dl">;
		
		/** Callable property that returns a <dt> element with the primitives applied. */
		readonly dt: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dt">;
		
		/** Callable property that returns a <em> element with the primitives applied. */
		readonly em: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"em">;
		
		/** Callable property that returns a <embed> element with the primitives applied. */
		readonly embed: ((...primitives: Primitives[]) => HTMLEmbedElement) &
			Reflex.Core.BranchFunction<"embed">;
		
		/** Callable property that returns a <fieldset> element with the primitives applied. */
		readonly fieldset: ((...primitives: Primitives[]) => HTMLFieldSetElement) &
			Reflex.Core.BranchFunction<"fieldset">;
		
		/** Callable property that returns a <figcaption> element with the primitives applied. */
		readonly figcaption: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"figcaption">;
		
		/** Callable property that returns a <figure> element with the primitives applied. */
		readonly figure: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"figure">;
		
		/** Callable property that returns a <footer> element with the primitives applied. */
		readonly footer: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"footer">;
		
		/** Callable property that returns a <form> element with the primitives applied. */
		readonly form: ((...primitives: Primitives[]) => HTMLFormElement) &
			Reflex.Core.BranchFunction<"form">;
		
		/** Callable property that returns a <frame> element with the primitives applied. */
		readonly frame: ((...primitives: Primitives[]) => HTMLFrameElement) &
			Reflex.Core.BranchFunction<"frame">;
		
		/** Callable property that returns a <frameset> element with the primitives applied. */
		readonly frameset: ((...primitives: Primitives[]) => HTMLFrameSetElement) &
			Reflex.Core.BranchFunction<"frameset">;
		
		/** Callable property that returns an <h1> element with the primitives applied. */
		readonly h1: ((...primitives: Primitives[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h1">;
		
		/** Callable property that returns an <h2> element with the primitives applied. */
		readonly h2: ((...primitives: Primitives[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h2">;
		
		/** Callable property that returns an <h3> element with the primitives applied. */
		readonly h3: ((...primitives: Primitives[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h3">;
		
		/** Callable property that returns an <h4> element with the primitives applied. */
		readonly h4: ((...primitives: Primitives[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h4">;
		
		/** Callable property that returns an <h5> element with the primitives applied. */
		readonly h5: ((...primitives: Primitives[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h5">;
		
		/** Callable property that returns an <h6> element with the primitives applied. */
		readonly h6: ((...primitives: Primitives[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h6">;
		
		/** Callable property that returns a <header> element with the primitives applied. */
		readonly header: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"header">;
		
		/** Callable property that returns an <hgroup> element with the primitives applied. */
		readonly hgroup: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"hgroup">;
		
		/** Callable property that returns an <hr> element with the primitives applied. */
		readonly hr: ((...primitives: Primitives[]) => HTMLHRElement) &
			Reflex.Core.BranchFunction<"hr">;
		
		/** Callable property that returns an <i> element with the primitives applied. */
		readonly i: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"i">;
		
		/** Callable property that returns an <iframe> element with the primitives applied. */
		readonly iframe: ((...primitives: Primitives[]) => HTMLIFrameElement) &
			Reflex.Core.BranchFunction<"iframe">;
		
		/** Callable property that returns an <img> element with the primitives applied. */
		readonly img: ((...primitives: Primitives[]) => HTMLImageElement) &
			Reflex.Core.BranchFunction<"img">;
		
		/** Callable property that returns an <ins> e**l>ement with the primitives applied. */
		readonly ins: ((...primitives: Primitives[]) => HTMLModElement) &
			Reflex.Core.BranchFunction<"ins">;
		
		/** Callable property that returns a <kbd> element with the primitives applied. */
		readonly kbd: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"kbd">;
		
		/** Callable property that returns a <label> element with the primitives applied. */
		readonly label: ((...primitives: Primitives[]) => HTMLLabelElement) &
			Reflex.Core.BranchFunction<"label">;
		
		/** Callable property that returns a <legend> element with the primitives applied. */
		readonly legend: ((...primitives: Primitives[]) => HTMLLegendElement) &
			Reflex.Core.BranchFunction<"legend">;
		
		/** Callable property that returns an <li> element with the primitives applied. */
		readonly li: ((...primitives: Primitives[]) => HTMLLIElement) &
			Reflex.Core.BranchFunction<"li">;
		
		/** Callable property that returns a <main> element with the primitives applied. */
		readonly main: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"main">;
		
		/** Callable property that returns a <map> element with the primitives applied. */
		readonly map: ((...primitives: Primitives[]) => HTMLMapElement) &
			Reflex.Core.BranchFunction<"map">;
		
		/** Callable property that returns a <mark> element with the primitives applied. */
		readonly mark: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"mark">;
		
		/** Callable property that returns a <marquee> element with the primitives applied. */
		readonly marquee: ((...primitives: Primitives[]) => HTMLMarqueeElement) &
			Reflex.Core.BranchFunction<"marquee">;
		
		/** Callable property that returns a <menu> element with the primitives applied. */
		readonly menu: ((...primitives: Primitives[]) => HTMLMenuElement) &
			Reflex.Core.BranchFunction<"menu">;
		
		/** Callable property that returns a <meter> element with the primitives applied. */
		readonly meter: ((...primitives: Primitives[]) => HTMLMeterElement) &
			Reflex.Core.BranchFunction<"meter">;
		
		/** Callable property that returns a <nav> element with the primitives applied. */
		readonly nav: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"nav">;
		
		/** Callable property that returns a <object> element with the primitives applied. */
		readonly object: ((...primitives: Primitives[]) => HTMLObjectElement) &
			Reflex.Core.BranchFunction<"object">;
		
		/** Callable property that returns a <ol> element with the primitives applied. */
		readonly ol: ((...primitives: Primitives[]) => HTMLOListElement) &
			Reflex.Core.BranchFunction<"ol">;
		
		/** Callable property that returns a <optgroup> element with the primitives applied. */
		readonly optgroup: ((...primitives: Primitives[]) => HTMLOptGroupElement) &
			Reflex.Core.BranchFunction<"optgroup">;
		
		/** Callable property that returns a <option> element with the primitives applied. */
		readonly option: ((...primitives: Primitives[]) => HTMLOptionElement) &
			Reflex.Core.BranchFunction<"option">;
		
		/** Callable property that returns a <output> element with the primitives applied. */
		readonly output: ((...primitives: Primitives[]) => HTMLOutputElement) &
			Reflex.Core.BranchFunction<"output">;
		
		/** Callable property that returns a <p> element with the primitives applied. */
		readonly p: ((...primitives: Primitives[]) => HTMLParagraphElement) &
			Reflex.Core.BranchFunction<"p">;
		
		/** Callable property that returns a <param> element with the primitives applied. */
		readonly param: ((...primitives: Primitives[]) => HTMLParamElement) &
			Reflex.Core.BranchFunction<"param">;
		
		/** Callable property that returns a <picture> element with the primitives applied. */
		readonly picture: ((...primitives: Primitives[]) => HTMLPictureElement) &
			Reflex.Core.BranchFunction<"picture">;
		
		/** Callable property that returns a <pre> element with the primitives applied. */
		readonly pre: ((...primitives: Primitives[]) => HTMLPreElement) &
			Reflex.Core.BranchFunction<"pre">;
		
		/** Callable property that returns a <progress> element with the primitives applied. */
		readonly progress: ((...primitives: Primitives[]) => HTMLProgressElement) &
			Reflex.Core.BranchFunction<"progress">;
		
		/** Callable property that returns a <q> element with the primitives applied. */
		readonly q: ((...primitives: Primitives[]) => HTMLQuoteElement) &
			Reflex.Core.BranchFunction<"q">;
		
		/** Callable property that returns a <rp> element with the primitives applied. */
		readonly rp: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"rp">;
		
		/** Callable property that returns a <rt> element with the primitives applied. */
		readonly rt: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"rt">;
		
		/** Callable property that returns a <ruby> element with the primitives applied. */
		readonly ruby: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"ruby">;
		
		/** Callable property that returns a <s> element with the primitives applied. */
		readonly s: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"s">;
		
		/** Callable property that returns a <samp> element with the primitives applied. */
		readonly samp: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"samp">;
		
		/** Callable property that returns a <section> element with the primitives applied. */
		readonly section: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"section">;
		
		/** Callable property that returns a <select> element with the primitives applied. */
		readonly select: ((...primitives: Primitives[]) => HTMLSelectElement) &
			Reflex.Core.BranchFunction<"select">;
		
		/** Callable property that returns a <slot> element with the primitives applied. */
		readonly slot: ((...primitives: Primitives[]) => HTMLSlotElement) &
			Reflex.Core.BranchFunction<"slot">;
		
		/** Callable property that returns a <small> element with the primitives applied. */
		readonly small: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"small">;
		
		/** Callable property that returns a <source> element with the primitives applied. */
		readonly source: ((...primitives: Primitives[]) => HTMLSourceElement) &
			Reflex.Core.BranchFunction<"source">;
		
		/** Callable property that returns a <span> element with the primitives applied. */
		readonly span: ((...primitives: Primitives[]) => HTMLSpanElement) &
			Reflex.Core.BranchFunction<"span">;
		
		/** Callable property that returns a <strong> element with the primitives applied. */
		readonly strong: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"strong">;
		
		/** Callable property that returns a <sub> element with the primitives applied. */
		readonly sub: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"sub">;
		
		/** Callable property that returns a <summary> element with the primitives applied. */
		readonly summary: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"summary">;
		
		/** Callable property that returns a <sup> element with the primitives applied. */
		readonly sup: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"sup">;
		
		/** Callable property that returns a <table> element with the primitives applied. */
		readonly table: ((...primitives: Primitives[]) => HTMLTableElement) &
			Reflex.Core.BranchFunction<"table">;
		
		/** Callable property that returns a <tbody> element with the primitives applied. */
		readonly tbody: ((...primitives: Primitives[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"tbody">;
		
		/** Callable property that returns a <td> element with the primitives applied. */
		readonly td: ((...primitives: Primitives[]) => HTMLTableDataCellElement) &
			Reflex.Core.BranchFunction<"td">;
		
		/** Callable property that returns a <template> element with the primitives applied. */
		readonly template: ((...primitives: Primitives[]) => HTMLTemplateElement) &
			Reflex.Core.BranchFunction<"template">;
		
		/** Callable property that returns a <textarea> element with the primitives applied. */
		readonly textarea: ((...primitives: Primitives[]) => HTMLTextAreaElement) &
			Reflex.Core.BranchFunction<"textarea">;
		
		/** Callable property that returns a <tfoot> element with the primitives applied. */
		readonly tfoot: ((...primitives: Primitives[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"tfoot">;
		
		/** Callable property that returns a <th> element with the primitives applied. */
		readonly th: ((...primitives: Primitives[]) => HTMLTableHeaderCellElement) &
			Reflex.Core.BranchFunction<"th">;
		
		/** Callable property that returns a <thead> element with the primitives applied. */
		readonly thead: ((...primitives: Primitives[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"thead">;
		
		/** Callable property that returns a <time> element with the primitives applied. */
		readonly time: ((...primitives: Primitives[]) => HTMLTimeElement) &
			Reflex.Core.BranchFunction<"time">;
		
		/** Callable property that returns a <tr> element with the primitives applied. */
		readonly tr: ((...primitives: Primitives[]) => HTMLTableRowElement) &
			Reflex.Core.BranchFunction<"tr">;
		
		/** Callable property that returns a <track> element with the primitives applied. */
		readonly track: ((...primitives: Primitives[]) => HTMLTrackElement) &
			Reflex.Core.BranchFunction<"track">;
		
		/** Callable property that returns a <u> element with the primitives applied. */
		readonly u: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"u">;
		
		/** Callable property that returns a <ul> element with the primitives applied. */
		readonly ul: ((...primitives: Primitives[]) => HTMLUListElement) &
			Reflex.Core.BranchFunction<"ul">;
		
		/** Callable property that returns a <var> element with the primitives applied. */
		readonly var: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"var">;
		
		/** Callable property that returns a <video> element with the primitives applied. */
		readonly video: ((...primitives: Primitives[]) => HTMLVideoElement) &
			Reflex.Core.BranchFunction<"video">;
		
		/** Callable property that returns a <wbr> element with the primitives applied. */
		readonly wbr: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"wbr">;
		
		//# <input> Elements
		
		/** Callable property that returns an <input type="button"> element with the primitives applied. */
		readonly inputButton: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="checkbox"> element with the primitives applied. */
		readonly inputCheckbox: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="color"> element with the primitives applied. */
		readonly inputColor: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="date"> element with the primitives applied. */
		readonly inputDate: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="datetime"> element with the primitives applied. */
		readonly inputDatetime: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="datetime-local"> element with the primitives applied. */
		readonly inputDatetimeLocal: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="email"> element with the primitives applied. */
		readonly inputEmail: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="file"> element with the primitives applied. */
		readonly inputFile: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="hidden"> element with the primitives applied. */
		readonly inputHidden: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="image"> element with the primitives applied. */
		readonly inputImage: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="month"> element with the primitives applied. */
		readonly inputMonth: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="number"> element with the primitives applied. */
		readonly inputNumber: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="password"> element with the primitives applied. */
		readonly inputPassword: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="radio"> element with the primitives applied. */
		readonly inputRadio: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="range"> element with the primitives applied. */
		readonly inputRange: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="reset"> element with the primitives applied. */
		readonly inputReset: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="search"> element with the primitives applied. */
		readonly inputSearch: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="submit"> element with the primitives applied. */
		readonly inputSubmit: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="tel"> element with the primitives applied. */
		readonly inputTel: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="text"> element with the primitives applied. */
		readonly inputText: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="time"> element with the primitives applied. */
		readonly inputTime: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="url"> element with the primitives applied. */
		readonly inputUrl: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="week"> element with the primitives applied. */
		readonly inputWeek: ((...primitives: Primitives[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		//# Non-Visual Elements
		
		/** Callable property that returns an <html> element with the primitives applied. */
		readonly html: ((...primitives: Primitives[]) => HTMLHtmlElement) &
			Reflex.Core.BranchFunction<"html">;
		
		/** Callable property that returns an <head> element with the primitives applied. */
		readonly head: ((...primitives: Primitives[]) => HTMLHeadElement) &
			Reflex.Core.BranchFunction<"head">;
		
		/** Callable property that returns a <body> element with the primitives applied. */
		readonly body: ((...primitives: Primitives[]) => HTMLBodyElement) &
			Reflex.Core.BranchFunction<"body">;
		
		/** Callable property that returns a <meta> element with the primitives applied. */
		readonly meta: ((...primitives: Primitives[]) => HTMLMetaElement) &
			Reflex.Core.BranchFunction<"meta">;
		
		/** Callable property that returns an <link> element with the primitives applied. */
		readonly link: ((...primitives: Primitives[]) => HTMLLinkElement) &
			Reflex.Core.BranchFunction<"link">;
		
		/** Callable property that returns a <style> element with the primitives applied. */
		readonly style: ((...primitives: Primitives[]) => HTMLStyleElement) &
			Reflex.Core.BranchFunction<"style">;
		
		/** Callable property that returns a <script> element with the primitives applied. */
		readonly script: ((...primitives: Primitives[]) => HTMLScriptElement) &
			Reflex.Core.BranchFunction<"script">;
		
		/** Callable property that returns a <noscript> element with the primitives applied. */
		readonly noscript: ((...primitives: Primitives[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"noscript">;
		
		/** Callable property that returns a <base> element with the primitives applied. */
		readonly base: ((...primitives: Primitives[]) => HTMLBaseElement) &
			Reflex.Core.BranchFunction<"base">;
		
		/** Callable property that returns a <basefont> element with the primitives applied. */
		readonly basefont: ((...primitives: Primitives[]) => HTMLBaseFontElement) &
			Reflex.Core.BranchFunction<"basefont">;
	}
}
