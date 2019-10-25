
//# on() function declarations

/**
 * 
 */
declare function on<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Atomics,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	forces: (() => void) | (() => void)[],
	callback: (e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on<A1>(
	forces: ((a1: A1) => void) | ((a1: A1) => void)[],
	callback: (a1: A1, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<[A1]>;

/**
 * 
 */
declare function on<A1, A2>(
	forces: ((a1: A1, a2: A2) => void) | ((a1: A1, a2: A2) => void)[],
	callback: (a1: A1, a2: A2, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<[A1, A2]>;

/**
 * 
 */
declare function on<A1, A2, A3>(
	forces: ((a1: A1, a2: A2, a3: A3) => void) | ((a1: A1, a2: A2, a3: A3) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<[A1, A2, A3]>;

/**
 * 
 */
declare function on<A1, A2, A3, A4>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<[A1, A2, A3, A4]>;

/**
 * 
 */
declare function on<A1, A2, A3, A4, A5>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<[A1, A2, A3, A4, A5]>;

/**
 * 
 */
declare function on<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on<T>(
	array: Reflex.Core.ArrayForce<T>,
	renderFn: (item: T, e: HTMLElement, index: number) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.content,
	callback: (
		kind: Reflex.mutation.contentAdd | Reflex.mutation.contentRemove,
		text: Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.contentAdd,
	callback: (text: Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.contentRemove,
	callback: (text: Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * Wraps a function that executes during restoration.
 */
declare function on<A extends any[]>(
	callback: (e: HTMLElement, ...args: A) => Reflex.ML.Atomics,
	...args: A
): Reflex.Core.Recurrent;

//# once() function declarations

/**
 * 
 */
declare function once<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Atomics,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	forces: (() => void) | (() => void)[],
	callback: (e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once<A1>(
	forces: ((a1: A1) => void) | ((a1: A1) => void)[],
	callback: (a1: A1, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<[A1]>;

/**
 * 
 */
declare function once<A1, A2>(
	forces: ((a1: A1, a2: A2) => void) | ((a1: A1, a2: A2) => void)[],
	callback: (a1: A1, a2: A2, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<[A1, A2]>;

/**
 * 
 */
declare function once<A1, A2, A3>(
	forces: ((a1: A1, a2: A2, a3: A3) => void) | ((a1: A1, a2: A2, a3: A3) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<[A1, A2, A3]>;

/**
 * 
 */
declare function once<A1, A2, A3, A4>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<[A1, A2, A3, A4]>;

/**
 * 
 */
declare function once<A1, A2, A3, A4, A5>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<[A1, A2, A3, A4, A5]>;

/**
 * 
 */
declare function once<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once<T>(
	forces: Reflex.Core.ArrayForce<T>,
	renderFn: (item: T) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.content,
	callback: (
		kind: Reflex.mutation.contentAdd | Reflex.mutation.contentRemove,
		text: Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.contentAdd,
	callback: (text: Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.contentRemove,
	callback: (text: Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

//# only() function declarations

/**
 * 
 */
declare function only<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Atomics,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only<A extends any[]>(
	forces: (...args: A) => void,
	callback: (...args: A) => Reflex.ML.Atomics
): Reflex.Core.Recurrent<A>;

/**
 * 
 */
declare function only<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.content,
	callback: (
		kind: Reflex.mutation.contentAdd | Reflex.mutation.contentRemove,
		text: Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.contentAdd,
	callback: (text: Text) => Reflex.ML.Atomics
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.contentRemove,
	callback: (text: Text) => Reflex.ML.Atomics
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
declare function attach(...atomics: Reflex.ML.Atomics[]): { 
	to: (target: Reflex.ML.Branch) => void;
};

declare namespace Reflex.ML
{
	export type Node = HTMLElement | Text;
	export type Branch = HTMLElement;
	export type Atomic = Core.Atomic<Node, Branch, string>;
	export type Atomics = Core.Atomics<Node, Branch, string>;
	
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
		
		/** Callable property that returns an <a> element with the atomics applied. */
		readonly a: ((...atomics: Atomics[]) => HTMLAnchorElement) &
			Reflex.Core.BranchFunction<"a">;
		
		/** Callable property that returns an <abbr> element with the atomics applied. */
		readonly abbr: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"abbr">;
		
		/** Callable property that returns an <address> element with the atomics applied. */
		readonly address: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"address">;
		
		/** Callable property that returns an <area> element with the atomics applied. */
		readonly area: ((...atomics: Atomics[]) => HTMLAreaElement) &
			Reflex.Core.BranchFunction<"area">;
		
		/** Callable property that returns an <article> element with the atomics applied. */
		readonly article: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"article">;
		
		/** Callable property that returns an <aside> element with the atomics applied. */
		readonly aside: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"aside">;
		
		/** Callable property that returns an <audio> element with the atomics applied. */
		readonly audio: ((...atomics: Atomics[]) => HTMLAudioElement) &
			Reflex.Core.BranchFunction<"audio">;
		
		/** Callable property that returns a <b> element with the atomics applied. */
		readonly b: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"b">;
		
		/** Callable property that returns a <bdi> element with the atomics applied. */
		readonly bdi: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"bdi">;
		
		/** Callable property that returns a <bdo> element with the atomics applied. */
		readonly bdo: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"bdo">;
		
		/** Callable property that returns a <blockquote> element with the atomics applied. */
		readonly blockquote: ((...atomics: Atomics[]) => HTMLQuoteElement) &
			Reflex.Core.BranchFunction<"blockquote">;
		
		/** Callable property that returns a <br> element with the atomics applied. */
		readonly br: ((...atomics: Atomics[]) => HTMLBRElement) &
			Reflex.Core.BranchFunction<"br">;
		
		/** Callable property that returns a <button> element with the atomics applied. */
		readonly button: ((...atomics: Atomics[]) => HTMLButtonElement) &
			Reflex.Core.BranchFunction<"button">;
		
		/** Callable property that returns a <canvas> element with the atomics applied. */
		readonly canvas: ((...atomics: Atomics[]) => HTMLCanvasElement) &
			Reflex.Core.BranchFunction<"canvas">;
		
		/** Callable property that returns a <caption> element with the atomics applied. */
		readonly caption: ((...atomics: Atomics[]) => HTMLTableCaptionElement) &
			Reflex.Core.BranchFunction<"caption">;
		
		/** Callable property that returns a <cite> element with the atomics applied. */
		readonly cite: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"cite">;
		
		/** Callable property that returns a <code> element with the atomics applied. */
		readonly code: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"code">;
		
		/** Callable property that returns a <col> element with the atomics applied. */
		readonly col: ((...atomics: Atomics[]) => HTMLTableColElement) &
			Reflex.Core.BranchFunction<"col">;
		
		/** Callable property that returns a <colgroup> element with the atomics applied. */
		readonly colgroup: ((...atomics: Atomics[]) => HTMLTableColElement) &
			Reflex.Core.BranchFunction<"colgroup">;
		
		/** Callable property that returns a <data> element with the atomics applied. */
		readonly data: ((...atomics: Atomics[]) => HTMLDataElement) &
			Reflex.Core.BranchFunction<"data">;
		
		/** Callable property that returns a <datalist> element with the atomics applied. */
		readonly datalist: ((...atomics: Atomics[]) => HTMLDataListElement) &
			Reflex.Core.BranchFunction<"datalist">;
		
		/** Callable property that returns a <dd> element with the atomics applied. */
		readonly dd: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dd">;
		
		/** Callable property that returns a <del> element with the atomics applied. */
		readonly del: ((...atomics: Atomics[]) => HTMLModElement) &
			Reflex.Core.BranchFunction<"del">;
		
		/** Callable property that returns a <details> element with the atomics applied. */
		readonly details: ((...atomics: Atomics[]) => HTMLDetailsElement) &
			Reflex.Core.BranchFunction<"details">;
		
		/** Callable property that returns a <dfn> element with the atomics applied. */
		readonly dfn: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dfn">;
		
		/** Callable property that returns a <dir> element with the atomics applied. */
		readonly dir: ((...atomics: Atomics[]) => HTMLDirectoryElement) &
			Reflex.Core.BranchFunction<"dir">;
		
		/** Callable property that returns a <div> element with the atomics applied. */
		readonly div: ((...atomics: Atomics[]) => HTMLDivElement) &
			Reflex.Core.BranchFunction<"div">;
		
		/** Callable property that returns a <dl> element with the atomics applied. */
		readonly dl: ((...atomics: Atomics[]) => HTMLDListElement) &
			Reflex.Core.BranchFunction<"dl">;
		
		/** Callable property that returns a <dt> element with the atomics applied. */
		readonly dt: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dt">;
		
		/** Callable property that returns a <em> element with the atomics applied. */
		readonly em: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"em">;
		
		/** Callable property that returns a <embed> element with the atomics applied. */
		readonly embed: ((...atomics: Atomics[]) => HTMLEmbedElement) &
			Reflex.Core.BranchFunction<"embed">;
		
		/** Callable property that returns a <fieldset> element with the atomics applied. */
		readonly fieldset: ((...atomics: Atomics[]) => HTMLFieldSetElement) &
			Reflex.Core.BranchFunction<"fieldset">;
		
		/** Callable property that returns a <figcaption> element with the atomics applied. */
		readonly figcaption: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"figcaption">;
		
		/** Callable property that returns a <figure> element with the atomics applied. */
		readonly figure: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"figure">;
		
		/** Callable property that returns a <footer> element with the atomics applied. */
		readonly footer: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"footer">;
		
		/** Callable property that returns a <form> element with the atomics applied. */
		readonly form: ((...atomics: Atomics[]) => HTMLFormElement) &
			Reflex.Core.BranchFunction<"form">;
		
		/** Callable property that returns a <frame> element with the atomics applied. */
		readonly frame: ((...atomics: Atomics[]) => HTMLFrameElement) &
			Reflex.Core.BranchFunction<"frame">;
		
		/** Callable property that returns a <frameset> element with the atomics applied. */
		readonly frameset: ((...atomics: Atomics[]) => HTMLFrameSetElement) &
			Reflex.Core.BranchFunction<"frameset">;
		
		/** Callable property that returns an <h1> element with the atomics applied. */
		readonly h1: ((...atomics: Atomics[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h1">;
		
		/** Callable property that returns an <h2> element with the atomics applied. */
		readonly h2: ((...atomics: Atomics[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h2">;
		
		/** Callable property that returns an <h3> element with the atomics applied. */
		readonly h3: ((...atomics: Atomics[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h3">;
		
		/** Callable property that returns an <h4> element with the atomics applied. */
		readonly h4: ((...atomics: Atomics[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h4">;
		
		/** Callable property that returns an <h5> element with the atomics applied. */
		readonly h5: ((...atomics: Atomics[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h5">;
		
		/** Callable property that returns an <h6> element with the atomics applied. */
		readonly h6: ((...atomics: Atomics[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h6">;
		
		/** Callable property that returns a <header> element with the atomics applied. */
		readonly header: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"header">;
		
		/** Callable property that returns an <hgroup> element with the atomics applied. */
		readonly hgroup: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"hgroup">;
		
		/** Callable property that returns an <hr> element with the atomics applied. */
		readonly hr: ((...atomics: Atomics[]) => HTMLHRElement) &
			Reflex.Core.BranchFunction<"hr">;
		
		/** Callable property that returns an <i> element with the atomics applied. */
		readonly i: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"i">;
		
		/** Callable property that returns an <iframe> element with the atomics applied. */
		readonly iframe: ((...atomics: Atomics[]) => HTMLIFrameElement) &
			Reflex.Core.BranchFunction<"iframe">;
		
		/** Callable property that returns an <img> element with the atomics applied. */
		readonly img: ((...atomics: Atomics[]) => HTMLImageElement) &
			Reflex.Core.BranchFunction<"img">;
		
		/** Callable property that returns an <ins> e**l>ement with the atomics applied. */
		readonly ins: ((...atomics: Atomics[]) => HTMLModElement) &
			Reflex.Core.BranchFunction<"ins">;
		
		/** Callable property that returns a <kbd> element with the atomics applied. */
		readonly kbd: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"kbd">;
		
		/** Callable property that returns a <label> element with the atomics applied. */
		readonly label: ((...atomics: Atomics[]) => HTMLLabelElement) &
			Reflex.Core.BranchFunction<"label">;
		
		/** Callable property that returns a <legend> element with the atomics applied. */
		readonly legend: ((...atomics: Atomics[]) => HTMLLegendElement) &
			Reflex.Core.BranchFunction<"legend">;
		
		/** Callable property that returns an <li> element with the atomics applied. */
		readonly li: ((...atomics: Atomics[]) => HTMLLIElement) &
			Reflex.Core.BranchFunction<"li">;
		
		/** Callable property that returns a <main> element with the atomics applied. */
		readonly main: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"main">;
		
		/** Callable property that returns a <map> element with the atomics applied. */
		readonly map: ((...atomics: Atomics[]) => HTMLMapElement) &
			Reflex.Core.BranchFunction<"map">;
		
		/** Callable property that returns a <mark> element with the atomics applied. */
		readonly mark: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"mark">;
		
		/** Callable property that returns a <marquee> element with the atomics applied. */
		readonly marquee: ((...atomics: Atomics[]) => HTMLMarqueeElement) &
			Reflex.Core.BranchFunction<"marquee">;
		
		/** Callable property that returns a <menu> element with the atomics applied. */
		readonly menu: ((...atomics: Atomics[]) => HTMLMenuElement) &
			Reflex.Core.BranchFunction<"menu">;
		
		/** Callable property that returns a <meter> element with the atomics applied. */
		readonly meter: ((...atomics: Atomics[]) => HTMLMeterElement) &
			Reflex.Core.BranchFunction<"meter">;
		
		/** Callable property that returns a <nav> element with the atomics applied. */
		readonly nav: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"nav">;
		
		/** Callable property that returns a <object> element with the atomics applied. */
		readonly object: ((...atomics: Atomics[]) => HTMLObjectElement) &
			Reflex.Core.BranchFunction<"object">;
		
		/** Callable property that returns a <ol> element with the atomics applied. */
		readonly ol: ((...atomics: Atomics[]) => HTMLOListElement) &
			Reflex.Core.BranchFunction<"ol">;
		
		/** Callable property that returns a <optgroup> element with the atomics applied. */
		readonly optgroup: ((...atomics: Atomics[]) => HTMLOptGroupElement) &
			Reflex.Core.BranchFunction<"optgroup">;
		
		/** Callable property that returns a <option> element with the atomics applied. */
		readonly option: ((...atomics: Atomics[]) => HTMLOptionElement) &
			Reflex.Core.BranchFunction<"option">;
		
		/** Callable property that returns a <output> element with the atomics applied. */
		readonly output: ((...atomics: Atomics[]) => HTMLOutputElement) &
			Reflex.Core.BranchFunction<"output">;
		
		/** Callable property that returns a <p> element with the atomics applied. */
		readonly p: ((...atomics: Atomics[]) => HTMLParagraphElement) &
			Reflex.Core.BranchFunction<"p">;
		
		/** Callable property that returns a <param> element with the atomics applied. */
		readonly param: ((...atomics: Atomics[]) => HTMLParamElement) &
			Reflex.Core.BranchFunction<"param">;
		
		/** Callable property that returns a <picture> element with the atomics applied. */
		readonly picture: ((...atomics: Atomics[]) => HTMLPictureElement) &
			Reflex.Core.BranchFunction<"picture">;
		
		/** Callable property that returns a <pre> element with the atomics applied. */
		readonly pre: ((...atomics: Atomics[]) => HTMLPreElement) &
			Reflex.Core.BranchFunction<"pre">;
		
		/** Callable property that returns a <progress> element with the atomics applied. */
		readonly progress: ((...atomics: Atomics[]) => HTMLProgressElement) &
			Reflex.Core.BranchFunction<"progress">;
		
		/** Callable property that returns a <q> element with the atomics applied. */
		readonly q: ((...atomics: Atomics[]) => HTMLQuoteElement) &
			Reflex.Core.BranchFunction<"q">;
		
		/** Callable property that returns a <rp> element with the atomics applied. */
		readonly rp: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"rp">;
		
		/** Callable property that returns a <rt> element with the atomics applied. */
		readonly rt: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"rt">;
		
		/** Callable property that returns a <ruby> element with the atomics applied. */
		readonly ruby: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"ruby">;
		
		/** Callable property that returns a <s> element with the atomics applied. */
		readonly s: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"s">;
		
		/** Callable property that returns a <samp> element with the atomics applied. */
		readonly samp: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"samp">;
		
		/** Callable property that returns a <section> element with the atomics applied. */
		readonly section: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"section">;
		
		/** Callable property that returns a <select> element with the atomics applied. */
		readonly select: ((...atomics: Atomics[]) => HTMLSelectElement) &
			Reflex.Core.BranchFunction<"select">;
		
		/** Callable property that returns a <slot> element with the atomics applied. */
		readonly slot: ((...atomics: Atomics[]) => HTMLSlotElement) &
			Reflex.Core.BranchFunction<"slot">;
		
		/** Callable property that returns a <small> element with the atomics applied. */
		readonly small: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"small">;
		
		/** Callable property that returns a <source> element with the atomics applied. */
		readonly source: ((...atomics: Atomics[]) => HTMLSourceElement) &
			Reflex.Core.BranchFunction<"source">;
		
		/** Callable property that returns a <span> element with the atomics applied. */
		readonly span: ((...atomics: Atomics[]) => HTMLSpanElement) &
			Reflex.Core.BranchFunction<"span">;
		
		/** Callable property that returns a <strong> element with the atomics applied. */
		readonly strong: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"strong">;
		
		/** Callable property that returns a <sub> element with the atomics applied. */
		readonly sub: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"sub">;
		
		/** Callable property that returns a <summary> element with the atomics applied. */
		readonly summary: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"summary">;
		
		/** Callable property that returns a <sup> element with the atomics applied. */
		readonly sup: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"sup">;
		
		/** Callable property that returns a <table> element with the atomics applied. */
		readonly table: ((...atomics: Atomics[]) => HTMLTableElement) &
			Reflex.Core.BranchFunction<"table">;
		
		/** Callable property that returns a <tbody> element with the atomics applied. */
		readonly tbody: ((...atomics: Atomics[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"tbody">;
		
		/** Callable property that returns a <td> element with the atomics applied. */
		readonly td: ((...atomics: Atomics[]) => HTMLTableDataCellElement) &
			Reflex.Core.BranchFunction<"td">;
		
		/** Callable property that returns a <template> element with the atomics applied. */
		readonly template: ((...atomics: Atomics[]) => HTMLTemplateElement) &
			Reflex.Core.BranchFunction<"template">;
		
		/** Callable property that returns a <textarea> element with the atomics applied. */
		readonly textarea: ((...atomics: Atomics[]) => HTMLTextAreaElement) &
			Reflex.Core.BranchFunction<"textarea">;
		
		/** Callable property that returns a <tfoot> element with the atomics applied. */
		readonly tfoot: ((...atomics: Atomics[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"tfoot">;
		
		/** Callable property that returns a <th> element with the atomics applied. */
		readonly th: ((...atomics: Atomics[]) => HTMLTableHeaderCellElement) &
			Reflex.Core.BranchFunction<"th">;
		
		/** Callable property that returns a <thead> element with the atomics applied. */
		readonly thead: ((...atomics: Atomics[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"thead">;
		
		/** Callable property that returns a <time> element with the atomics applied. */
		readonly time: ((...atomics: Atomics[]) => HTMLTimeElement) &
			Reflex.Core.BranchFunction<"time">;
		
		/** Callable property that returns a <tr> element with the atomics applied. */
		readonly tr: ((...atomics: Atomics[]) => HTMLTableRowElement) &
			Reflex.Core.BranchFunction<"tr">;
		
		/** Callable property that returns a <track> element with the atomics applied. */
		readonly track: ((...atomics: Atomics[]) => HTMLTrackElement) &
			Reflex.Core.BranchFunction<"track">;
		
		/** Callable property that returns a <u> element with the atomics applied. */
		readonly u: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"u">;
		
		/** Callable property that returns a <ul> element with the atomics applied. */
		readonly ul: ((...atomics: Atomics[]) => HTMLUListElement) &
			Reflex.Core.BranchFunction<"ul">;
		
		/** Callable property that returns a <var> element with the atomics applied. */
		readonly var: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"var">;
		
		/** Callable property that returns a <video> element with the atomics applied. */
		readonly video: ((...atomics: Atomics[]) => HTMLVideoElement) &
			Reflex.Core.BranchFunction<"video">;
		
		/** Callable property that returns a <wbr> element with the atomics applied. */
		readonly wbr: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"wbr">;
		
		//# <input> Elements
		
		/** Callable property that returns an <input type="button"> element with the atomics applied. */
		readonly inputButton: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="checkbox"> element with the atomics applied. */
		readonly inputCheckbox: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="color"> element with the atomics applied. */
		readonly inputColor: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="date"> element with the atomics applied. */
		readonly inputDate: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="datetime"> element with the atomics applied. */
		readonly inputDatetime: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="datetime-local"> element with the atomics applied. */
		readonly inputDatetimeLocal: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="email"> element with the atomics applied. */
		readonly inputEmail: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="file"> element with the atomics applied. */
		readonly inputFile: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="hidden"> element with the atomics applied. */
		readonly inputHidden: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="image"> element with the atomics applied. */
		readonly inputImage: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="month"> element with the atomics applied. */
		readonly inputMonth: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="number"> element with the atomics applied. */
		readonly inputNumber: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="password"> element with the atomics applied. */
		readonly inputPassword: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="radio"> element with the atomics applied. */
		readonly inputRadio: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="range"> element with the atomics applied. */
		readonly inputRange: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="reset"> element with the atomics applied. */
		readonly inputReset: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="search"> element with the atomics applied. */
		readonly inputSearch: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="submit"> element with the atomics applied. */
		readonly inputSubmit: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="tel"> element with the atomics applied. */
		readonly inputTel: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="text"> element with the atomics applied. */
		readonly inputText: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="time"> element with the atomics applied. */
		readonly inputTime: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="url"> element with the atomics applied. */
		readonly inputUrl: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="week"> element with the atomics applied. */
		readonly inputWeek: ((...atomics: Atomics[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		//# Non-Visual Elements
		
		/** Callable property that returns an <html> element with the atomics applied. */
		readonly html: ((...atomics: Atomics[]) => HTMLHtmlElement) &
			Reflex.Core.BranchFunction<"html">;
		
		/** Callable property that returns an <head> element with the atomics applied. */
		readonly head: ((...atomics: Atomics[]) => HTMLHeadElement) &
			Reflex.Core.BranchFunction<"head">;
		
		/** Callable property that returns a <body> element with the atomics applied. */
		readonly body: ((...atomics: Atomics[]) => HTMLBodyElement) &
			Reflex.Core.BranchFunction<"body">;
		
		/** Callable property that returns a <meta> element with the atomics applied. */
		readonly meta: ((...atomics: Atomics[]) => HTMLMetaElement) &
			Reflex.Core.BranchFunction<"meta">;
		
		/** Callable property that returns an <link> element with the atomics applied. */
		readonly link: ((...atomics: Atomics[]) => HTMLLinkElement) &
			Reflex.Core.BranchFunction<"link">;
		
		/** Callable property that returns a <style> element with the atomics applied. */
		readonly style: ((...atomics: Atomics[]) => HTMLStyleElement) &
			Reflex.Core.BranchFunction<"style">;
		
		/** Callable property that returns a <script> element with the atomics applied. */
		readonly script: ((...atomics: Atomics[]) => HTMLScriptElement) &
			Reflex.Core.BranchFunction<"script">;
		
		/** Callable property that returns a <noscript> element with the atomics applied. */
		readonly noscript: ((...atomics: Atomics[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"noscript">;
		
		/** Callable property that returns a <base> element with the atomics applied. */
		readonly base: ((...atomics: Atomics[]) => HTMLBaseElement) &
			Reflex.Core.BranchFunction<"base">;
		
		/** Callable property that returns a <basefont> element with the atomics applied. */
		readonly basefont: ((...atomics: Atomics[]) => HTMLBaseFontElement) &
			Reflex.Core.BranchFunction<"basefont">;
	}
}
