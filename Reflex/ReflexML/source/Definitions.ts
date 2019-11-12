
//# on() function declarations

/**
 * 
 */
declare function on<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Atomic,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	forces: (() => void) | (() => void)[],
	callback: (e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on<A1>(
	forces: ((a1: A1) => void) | ((a1: A1) => void)[],
	callback: (a1: A1, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<[A1]>;

/**
 * 
 */
declare function on<A1, A2>(
	forces: ((a1: A1, a2: A2) => void) | ((a1: A1, a2: A2) => void)[],
	callback: (a1: A1, a2: A2, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<[A1, A2]>;

/**
 * 
 */
declare function on<A1, A2, A3>(
	forces: ((a1: A1, a2: A2, a3: A3) => void) | ((a1: A1, a2: A2, a3: A3) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<[A1, A2, A3]>;

/**
 * 
 */
declare function on<A1, A2, A3, A4>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<[A1, A2, A3, A4]>;

/**
 * 
 */
declare function on<A1, A2, A3, A4, A5>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<[A1, A2, A3, A4, A5]>;

/**
 * 
 */
declare function on<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on<T>(
	array: Reflex.Core.ArrayForce<T>,
	renderFn: (item: T, e: HTMLElement, index: number) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.leaf,
	callback: (
		kind: Reflex.mutation.leafAdd | Reflex.mutation.leafRemove,
		text: Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.leafAdd,
	callback: (text: Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.leafRemove,
	callback: (text: Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * Wraps a function that executes during restoration.
 */
declare function on<A extends any[]>(
	callback: (e: HTMLElement, ...args: A) => Reflex.ML.Atomic,
	...args: A
): Reflex.Core.Recurrent;

//# once() function declarations

/**
 * 
 */
declare function once<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Atomic,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	forces: (() => void) | (() => void)[],
	callback: (e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once<A1>(
	forces: ((a1: A1) => void) | ((a1: A1) => void)[],
	callback: (a1: A1, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<[A1]>;

/**
 * 
 */
declare function once<A1, A2>(
	forces: ((a1: A1, a2: A2) => void) | ((a1: A1, a2: A2) => void)[],
	callback: (a1: A1, a2: A2, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<[A1, A2]>;

/**
 * 
 */
declare function once<A1, A2, A3>(
	forces: ((a1: A1, a2: A2, a3: A3) => void) | ((a1: A1, a2: A2, a3: A3) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<[A1, A2, A3]>;

/**
 * 
 */
declare function once<A1, A2, A3, A4>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<[A1, A2, A3, A4]>;

/**
 * 
 */
declare function once<A1, A2, A3, A4, A5>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<[A1, A2, A3, A4, A5]>;

/**
 * 
 */
declare function once<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once<T>(
	forces: Reflex.Core.ArrayForce<T>,
	renderFn: (item: T) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.leaf,
	callback: (
		kind: Reflex.mutation.leafAdd | Reflex.mutation.leafRemove,
		text: Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.leafAdd,
	callback: (text: Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.leafRemove,
	callback: (text: Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

//# only() function declarations

/**
 * 
 */
declare function only<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Atomic,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only<A extends any[]>(
	forces: (...args: A) => void,
	callback: (...args: A) => Reflex.ML.Atomic
): Reflex.Core.Recurrent<A>;

/**
 * 
 */
declare function only<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.leaf,
	callback: (
		kind: Reflex.mutation.leafAdd | Reflex.mutation.leafRemove,
		text: Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.leafAdd,
	callback: (text: Text) => Reflex.ML.Atomic
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.leafRemove,
	callback: (text: Text) => Reflex.ML.Atomic
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
declare function attach(...atomics: Reflex.ML.Atomic[]): { 
	to: (target: Reflex.ML.Branch) => void;
};

declare namespace Reflex.ML
{
	export type Branch = HTMLElement;
	export type Leaf = Text;
	export type Atomic = Core.Atomic<Branch, Leaf, string>;
	
	/** Atomize typings for Reflex.ML */
	export interface IVolatile extends Core.IVolatile<Branch, Leaf> { }
	export interface IAtomizeInfo extends Core.IAtomizeInfo<Branch, Leaf> { }
	
	export interface Namespace extends Core.ILeafNamespace<Text>
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
		readonly a: ((...atomics: Atomic[]) => HTMLAnchorElement) &
			Reflex.Core.BranchFunction<"a">;
		
		/** Callable property that returns an <abbr> element with the atomics applied. */
		readonly abbr: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"abbr">;
		
		/** Callable property that returns an <address> element with the atomics applied. */
		readonly address: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"address">;
		
		/** Callable property that returns an <area> element with the atomics applied. */
		readonly area: ((...atomics: Atomic[]) => HTMLAreaElement) &
			Reflex.Core.BranchFunction<"area">;
		
		/** Callable property that returns an <article> element with the atomics applied. */
		readonly article: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"article">;
		
		/** Callable property that returns an <aside> element with the atomics applied. */
		readonly aside: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"aside">;
		
		/** Callable property that returns an <audio> element with the atomics applied. */
		readonly audio: ((...atomics: Atomic[]) => HTMLAudioElement) &
			Reflex.Core.BranchFunction<"audio">;
		
		/** Callable property that returns a <b> element with the atomics applied. */
		readonly b: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"b">;
		
		/** Callable property that returns a <bdi> element with the atomics applied. */
		readonly bdi: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"bdi">;
		
		/** Callable property that returns a <bdo> element with the atomics applied. */
		readonly bdo: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"bdo">;
		
		/** Callable property that returns a <blockquote> element with the atomics applied. */
		readonly blockquote: ((...atomics: Atomic[]) => HTMLQuoteElement) &
			Reflex.Core.BranchFunction<"blockquote">;
		
		/** Callable property that returns a <br> element with the atomics applied. */
		readonly br: ((...atomics: Atomic[]) => HTMLBRElement) &
			Reflex.Core.BranchFunction<"br">;
		
		/** Callable property that returns a <button> element with the atomics applied. */
		readonly button: ((...atomics: Atomic[]) => HTMLButtonElement) &
			Reflex.Core.BranchFunction<"button">;
		
		/** Callable property that returns a <canvas> element with the atomics applied. */
		readonly canvas: ((...atomics: Atomic[]) => HTMLCanvasElement) &
			Reflex.Core.BranchFunction<"canvas">;
		
		/** Callable property that returns a <caption> element with the atomics applied. */
		readonly caption: ((...atomics: Atomic[]) => HTMLTableCaptionElement) &
			Reflex.Core.BranchFunction<"caption">;
		
		/** Callable property that returns a <cite> element with the atomics applied. */
		readonly cite: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"cite">;
		
		/** Callable property that returns a <code> element with the atomics applied. */
		readonly code: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"code">;
		
		/** Callable property that returns a <col> element with the atomics applied. */
		readonly col: ((...atomics: Atomic[]) => HTMLTableColElement) &
			Reflex.Core.BranchFunction<"col">;
		
		/** Callable property that returns a <colgroup> element with the atomics applied. */
		readonly colgroup: ((...atomics: Atomic[]) => HTMLTableColElement) &
			Reflex.Core.BranchFunction<"colgroup">;
		
		/** Callable property that returns a <data> element with the atomics applied. */
		readonly data: ((...atomics: Atomic[]) => HTMLDataElement) &
			Reflex.Core.BranchFunction<"data">;
		
		/** Callable property that returns a <datalist> element with the atomics applied. */
		readonly datalist: ((...atomics: Atomic[]) => HTMLDataListElement) &
			Reflex.Core.BranchFunction<"datalist">;
		
		/** Callable property that returns a <dd> element with the atomics applied. */
		readonly dd: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dd">;
		
		/** Callable property that returns a <del> element with the atomics applied. */
		readonly del: ((...atomics: Atomic[]) => HTMLModElement) &
			Reflex.Core.BranchFunction<"del">;
		
		/** Callable property that returns a <details> element with the atomics applied. */
		readonly details: ((...atomics: Atomic[]) => HTMLDetailsElement) &
			Reflex.Core.BranchFunction<"details">;
		
		/** Callable property that returns a <dfn> element with the atomics applied. */
		readonly dfn: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dfn">;
		
		/** Callable property that returns a <dir> element with the atomics applied. */
		readonly dir: ((...atomics: Atomic[]) => HTMLDirectoryElement) &
			Reflex.Core.BranchFunction<"dir">;
		
		/** Callable property that returns a <div> element with the atomics applied. */
		readonly div: ((...atomics: Atomic[]) => HTMLDivElement) &
			Reflex.Core.BranchFunction<"div">;
		
		/** Callable property that returns a <dl> element with the atomics applied. */
		readonly dl: ((...atomics: Atomic[]) => HTMLDListElement) &
			Reflex.Core.BranchFunction<"dl">;
		
		/** Callable property that returns a <dt> element with the atomics applied. */
		readonly dt: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dt">;
		
		/** Callable property that returns a <em> element with the atomics applied. */
		readonly em: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"em">;
		
		/** Callable property that returns a <embed> element with the atomics applied. */
		readonly embed: ((...atomics: Atomic[]) => HTMLEmbedElement) &
			Reflex.Core.BranchFunction<"embed">;
		
		/** Callable property that returns a <fieldset> element with the atomics applied. */
		readonly fieldset: ((...atomics: Atomic[]) => HTMLFieldSetElement) &
			Reflex.Core.BranchFunction<"fieldset">;
		
		/** Callable property that returns a <figcaption> element with the atomics applied. */
		readonly figcaption: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"figcaption">;
		
		/** Callable property that returns a <figure> element with the atomics applied. */
		readonly figure: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"figure">;
		
		/** Callable property that returns a <footer> element with the atomics applied. */
		readonly footer: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"footer">;
		
		/** Callable property that returns a <form> element with the atomics applied. */
		readonly form: ((...atomics: Atomic[]) => HTMLFormElement) &
			Reflex.Core.BranchFunction<"form">;
		
		/** Callable property that returns a <frame> element with the atomics applied. */
		readonly frame: ((...atomics: Atomic[]) => HTMLFrameElement) &
			Reflex.Core.BranchFunction<"frame">;
		
		/** Callable property that returns a <frameset> element with the atomics applied. */
		readonly frameset: ((...atomics: Atomic[]) => HTMLFrameSetElement) &
			Reflex.Core.BranchFunction<"frameset">;
		
		/** Callable property that returns an <h1> element with the atomics applied. */
		readonly h1: ((...atomics: Atomic[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h1">;
		
		/** Callable property that returns an <h2> element with the atomics applied. */
		readonly h2: ((...atomics: Atomic[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h2">;
		
		/** Callable property that returns an <h3> element with the atomics applied. */
		readonly h3: ((...atomics: Atomic[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h3">;
		
		/** Callable property that returns an <h4> element with the atomics applied. */
		readonly h4: ((...atomics: Atomic[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h4">;
		
		/** Callable property that returns an <h5> element with the atomics applied. */
		readonly h5: ((...atomics: Atomic[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h5">;
		
		/** Callable property that returns an <h6> element with the atomics applied. */
		readonly h6: ((...atomics: Atomic[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h6">;
		
		/** Callable property that returns a <header> element with the atomics applied. */
		readonly header: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"header">;
		
		/** Callable property that returns an <hgroup> element with the atomics applied. */
		readonly hgroup: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"hgroup">;
		
		/** Callable property that returns an <hr> element with the atomics applied. */
		readonly hr: ((...atomics: Atomic[]) => HTMLHRElement) &
			Reflex.Core.BranchFunction<"hr">;
		
		/** Callable property that returns an <i> element with the atomics applied. */
		readonly i: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"i">;
		
		/** Callable property that returns an <iframe> element with the atomics applied. */
		readonly iframe: ((...atomics: Atomic[]) => HTMLIFrameElement) &
			Reflex.Core.BranchFunction<"iframe">;
		
		/** Callable property that returns an <img> element with the atomics applied. */
		readonly img: ((...atomics: Atomic[]) => HTMLImageElement) &
			Reflex.Core.BranchFunction<"img">;
		
		/** Callable property that returns an <ins> e**l>ement with the atomics applied. */
		readonly ins: ((...atomics: Atomic[]) => HTMLModElement) &
			Reflex.Core.BranchFunction<"ins">;
		
		/** Callable property that returns a <kbd> element with the atomics applied. */
		readonly kbd: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"kbd">;
		
		/** Callable property that returns a <label> element with the atomics applied. */
		readonly label: ((...atomics: Atomic[]) => HTMLLabelElement) &
			Reflex.Core.BranchFunction<"label">;
		
		/** Callable property that returns a <legend> element with the atomics applied. */
		readonly legend: ((...atomics: Atomic[]) => HTMLLegendElement) &
			Reflex.Core.BranchFunction<"legend">;
		
		/** Callable property that returns an <li> element with the atomics applied. */
		readonly li: ((...atomics: Atomic[]) => HTMLLIElement) &
			Reflex.Core.BranchFunction<"li">;
		
		/** Callable property that returns a <main> element with the atomics applied. */
		readonly main: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"main">;
		
		/** Callable property that returns a <map> element with the atomics applied. */
		readonly map: ((...atomics: Atomic[]) => HTMLMapElement) &
			Reflex.Core.BranchFunction<"map">;
		
		/** Callable property that returns a <mark> element with the atomics applied. */
		readonly mark: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"mark">;
		
		/** Callable property that returns a <marquee> element with the atomics applied. */
		readonly marquee: ((...atomics: Atomic[]) => HTMLMarqueeElement) &
			Reflex.Core.BranchFunction<"marquee">;
		
		/** Callable property that returns a <menu> element with the atomics applied. */
		readonly menu: ((...atomics: Atomic[]) => HTMLMenuElement) &
			Reflex.Core.BranchFunction<"menu">;
		
		/** Callable property that returns a <meter> element with the atomics applied. */
		readonly meter: ((...atomics: Atomic[]) => HTMLMeterElement) &
			Reflex.Core.BranchFunction<"meter">;
		
		/** Callable property that returns a <nav> element with the atomics applied. */
		readonly nav: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"nav">;
		
		/** Callable property that returns a <object> element with the atomics applied. */
		readonly object: ((...atomics: Atomic[]) => HTMLObjectElement) &
			Reflex.Core.BranchFunction<"object">;
		
		/** Callable property that returns a <ol> element with the atomics applied. */
		readonly ol: ((...atomics: Atomic[]) => HTMLOListElement) &
			Reflex.Core.BranchFunction<"ol">;
		
		/** Callable property that returns a <optgroup> element with the atomics applied. */
		readonly optgroup: ((...atomics: Atomic[]) => HTMLOptGroupElement) &
			Reflex.Core.BranchFunction<"optgroup">;
		
		/** Callable property that returns a <option> element with the atomics applied. */
		readonly option: ((...atomics: Atomic[]) => HTMLOptionElement) &
			Reflex.Core.BranchFunction<"option">;
		
		/** Callable property that returns a <output> element with the atomics applied. */
		readonly output: ((...atomics: Atomic[]) => HTMLOutputElement) &
			Reflex.Core.BranchFunction<"output">;
		
		/** Callable property that returns a <p> element with the atomics applied. */
		readonly p: ((...atomics: Atomic[]) => HTMLParagraphElement) &
			Reflex.Core.BranchFunction<"p">;
		
		/** Callable property that returns a <param> element with the atomics applied. */
		readonly param: ((...atomics: Atomic[]) => HTMLParamElement) &
			Reflex.Core.BranchFunction<"param">;
		
		/** Callable property that returns a <picture> element with the atomics applied. */
		readonly picture: ((...atomics: Atomic[]) => HTMLPictureElement) &
			Reflex.Core.BranchFunction<"picture">;
		
		/** Callable property that returns a <pre> element with the atomics applied. */
		readonly pre: ((...atomics: Atomic[]) => HTMLPreElement) &
			Reflex.Core.BranchFunction<"pre">;
		
		/** Callable property that returns a <progress> element with the atomics applied. */
		readonly progress: ((...atomics: Atomic[]) => HTMLProgressElement) &
			Reflex.Core.BranchFunction<"progress">;
		
		/** Callable property that returns a <q> element with the atomics applied. */
		readonly q: ((...atomics: Atomic[]) => HTMLQuoteElement) &
			Reflex.Core.BranchFunction<"q">;
		
		/** Callable property that returns a <rp> element with the atomics applied. */
		readonly rp: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"rp">;
		
		/** Callable property that returns a <rt> element with the atomics applied. */
		readonly rt: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"rt">;
		
		/** Callable property that returns a <ruby> element with the atomics applied. */
		readonly ruby: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"ruby">;
		
		/** Callable property that returns a <s> element with the atomics applied. */
		readonly s: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"s">;
		
		/** Callable property that returns a <samp> element with the atomics applied. */
		readonly samp: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"samp">;
		
		/** Callable property that returns a <section> element with the atomics applied. */
		readonly section: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"section">;
		
		/** Callable property that returns a <select> element with the atomics applied. */
		readonly select: ((...atomics: Atomic[]) => HTMLSelectElement) &
			Reflex.Core.BranchFunction<"select">;
		
		/** Callable property that returns a <slot> element with the atomics applied. */
		readonly slot: ((...atomics: Atomic[]) => HTMLSlotElement) &
			Reflex.Core.BranchFunction<"slot">;
		
		/** Callable property that returns a <small> element with the atomics applied. */
		readonly small: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"small">;
		
		/** Callable property that returns a <source> element with the atomics applied. */
		readonly source: ((...atomics: Atomic[]) => HTMLSourceElement) &
			Reflex.Core.BranchFunction<"source">;
		
		/** Callable property that returns a <span> element with the atomics applied. */
		readonly span: ((...atomics: Atomic[]) => HTMLSpanElement) &
			Reflex.Core.BranchFunction<"span">;
		
		/** Callable property that returns a <strong> element with the atomics applied. */
		readonly strong: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"strong">;
		
		/** Callable property that returns a <sub> element with the atomics applied. */
		readonly sub: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"sub">;
		
		/** Callable property that returns a <summary> element with the atomics applied. */
		readonly summary: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"summary">;
		
		/** Callable property that returns a <sup> element with the atomics applied. */
		readonly sup: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"sup">;
		
		/** Callable property that returns a <table> element with the atomics applied. */
		readonly table: ((...atomics: Atomic[]) => HTMLTableElement) &
			Reflex.Core.BranchFunction<"table">;
		
		/** Callable property that returns a <tbody> element with the atomics applied. */
		readonly tbody: ((...atomics: Atomic[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"tbody">;
		
		/** Callable property that returns a <td> element with the atomics applied. */
		readonly td: ((...atomics: Atomic[]) => HTMLTableDataCellElement) &
			Reflex.Core.BranchFunction<"td">;
		
		/** Callable property that returns a <template> element with the atomics applied. */
		readonly template: ((...atomics: Atomic[]) => HTMLTemplateElement) &
			Reflex.Core.BranchFunction<"template">;
		
		/** Callable property that returns a <textarea> element with the atomics applied. */
		readonly textarea: ((...atomics: Atomic[]) => HTMLTextAreaElement) &
			Reflex.Core.BranchFunction<"textarea">;
		
		/** Callable property that returns a <tfoot> element with the atomics applied. */
		readonly tfoot: ((...atomics: Atomic[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"tfoot">;
		
		/** Callable property that returns a <th> element with the atomics applied. */
		readonly th: ((...atomics: Atomic[]) => HTMLTableHeaderCellElement) &
			Reflex.Core.BranchFunction<"th">;
		
		/** Callable property that returns a <thead> element with the atomics applied. */
		readonly thead: ((...atomics: Atomic[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"thead">;
		
		/** Callable property that returns a <time> element with the atomics applied. */
		readonly time: ((...atomics: Atomic[]) => HTMLTimeElement) &
			Reflex.Core.BranchFunction<"time">;
		
		/** Callable property that returns a <tr> element with the atomics applied. */
		readonly tr: ((...atomics: Atomic[]) => HTMLTableRowElement) &
			Reflex.Core.BranchFunction<"tr">;
		
		/** Callable property that returns a <track> element with the atomics applied. */
		readonly track: ((...atomics: Atomic[]) => HTMLTrackElement) &
			Reflex.Core.BranchFunction<"track">;
		
		/** Callable property that returns a <u> element with the atomics applied. */
		readonly u: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"u">;
		
		/** Callable property that returns a <ul> element with the atomics applied. */
		readonly ul: ((...atomics: Atomic[]) => HTMLUListElement) &
			Reflex.Core.BranchFunction<"ul">;
		
		/** Callable property that returns a <var> element with the atomics applied. */
		readonly var: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"var">;
		
		/** Callable property that returns a <video> element with the atomics applied. */
		readonly video: ((...atomics: Atomic[]) => HTMLVideoElement) &
			Reflex.Core.BranchFunction<"video">;
		
		/** Callable property that returns a <wbr> element with the atomics applied. */
		readonly wbr: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"wbr">;
		
		//# <input> Elements
		
		/** Callable property that returns an <input type="button"> element with the atomics applied. */
		readonly inputButton: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="checkbox"> element with the atomics applied. */
		readonly inputCheckbox: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="color"> element with the atomics applied. */
		readonly inputColor: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="date"> element with the atomics applied. */
		readonly inputDate: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="datetime"> element with the atomics applied. */
		readonly inputDatetime: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="datetime-local"> element with the atomics applied. */
		readonly inputDatetimeLocal: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="email"> element with the atomics applied. */
		readonly inputEmail: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="file"> element with the atomics applied. */
		readonly inputFile: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="hidden"> element with the atomics applied. */
		readonly inputHidden: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="image"> element with the atomics applied. */
		readonly inputImage: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="month"> element with the atomics applied. */
		readonly inputMonth: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="number"> element with the atomics applied. */
		readonly inputNumber: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="password"> element with the atomics applied. */
		readonly inputPassword: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="radio"> element with the atomics applied. */
		readonly inputRadio: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="range"> element with the atomics applied. */
		readonly inputRange: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="reset"> element with the atomics applied. */
		readonly inputReset: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="search"> element with the atomics applied. */
		readonly inputSearch: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="submit"> element with the atomics applied. */
		readonly inputSubmit: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="tel"> element with the atomics applied. */
		readonly inputTel: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="text"> element with the atomics applied. */
		readonly inputText: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="time"> element with the atomics applied. */
		readonly inputTime: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="url"> element with the atomics applied. */
		readonly inputUrl: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="week"> element with the atomics applied. */
		readonly inputWeek: ((...atomics: Atomic[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		//# Non-Visual Elements
		
		/** Callable property that returns an <html> element with the atomics applied. */
		readonly html: ((...atomics: Atomic[]) => HTMLHtmlElement) &
			Reflex.Core.BranchFunction<"html">;
		
		/** Callable property that returns an <head> element with the atomics applied. */
		readonly head: ((...atomics: Atomic[]) => HTMLHeadElement) &
			Reflex.Core.BranchFunction<"head">;
		
		/** Callable property that returns a <body> element with the atomics applied. */
		readonly body: ((...atomics: Atomic[]) => HTMLBodyElement) &
			Reflex.Core.BranchFunction<"body">;
		
		/** Callable property that returns a <meta> element with the atomics applied. */
		readonly meta: ((...atomics: Atomic[]) => HTMLMetaElement) &
			Reflex.Core.BranchFunction<"meta">;
		
		/** Callable property that returns an <link> element with the atomics applied. */
		readonly link: ((...atomics: Atomic[]) => HTMLLinkElement) &
			Reflex.Core.BranchFunction<"link">;
		
		/** Callable property that returns a <style> element with the atomics applied. */
		readonly style: ((...atomics: Atomic[]) => HTMLStyleElement) &
			Reflex.Core.BranchFunction<"style">;
		
		/** Callable property that returns a <script> element with the atomics applied. */
		readonly script: ((...atomics: Atomic[]) => HTMLScriptElement) &
			Reflex.Core.BranchFunction<"script">;
		
		/** Callable property that returns a <noscript> element with the atomics applied. */
		readonly noscript: ((...atomics: Atomic[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"noscript">;
		
		/** Callable property that returns a <base> element with the atomics applied. */
		readonly base: ((...atomics: Atomic[]) => HTMLBaseElement) &
			Reflex.Core.BranchFunction<"base">;
		
		/** Callable property that returns a <basefont> element with the atomics applied. */
		readonly basefont: ((...atomics: Atomic[]) => HTMLBaseFontElement) &
			Reflex.Core.BranchFunction<"basefont">;
	}
}
