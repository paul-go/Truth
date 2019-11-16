
//# on() function declarations

/**
 * 
 */
declare function on<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Atom,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	forces: (() => void) | (() => void)[],
	callback: (e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on<A1>(
	forces: ((a1: A1) => void) | ((a1: A1) => void)[],
	callback: (a1: A1, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent<[A1]>;

/**
 * 
 */
declare function on<A1, A2>(
	forces: ((a1: A1, a2: A2) => void) | ((a1: A1, a2: A2) => void)[],
	callback: (a1: A1, a2: A2, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent<[A1, A2]>;

/**
 * 
 */
declare function on<A1, A2, A3>(
	forces: ((a1: A1, a2: A2, a3: A3) => void) | ((a1: A1, a2: A2, a3: A3) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent<[A1, A2, A3]>;

/**
 * 
 */
declare function on<A1, A2, A3, A4>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent<[A1, A2, A3, A4]>;

/**
 * 
 */
declare function on<A1, A2, A3, A4, A5>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent<[A1, A2, A3, A4, A5]>;

/**
 * 
 */
declare function on<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on<T>(
	array: Reflex.Core.ArrayForce<T>,
	renderFn: (item: T, e: HTMLElement, index: number) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.leaf,
	callback: (
		kind: Reflex.mutation.leafAdd | Reflex.mutation.leafRemove,
		text: Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.leafAdd,
	callback: (text: Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on(
	mutationEvent: Reflex.mutation.leafRemove,
	callback: (text: Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * Wraps a function that executes during restoration.
 */
declare function on<A extends any[]>(
	callback: (e: HTMLElement, ...args: A) => Reflex.ML.Atom,
	...args: A
): Reflex.Core.Recurrent;

//# once() function declarations

/**
 * 
 */
declare function once<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Atom,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	forces: (() => void) | (() => void)[],
	callback: (e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once<A1>(
	forces: ((a1: A1) => void) | ((a1: A1) => void)[],
	callback: (a1: A1, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent<[A1]>;

/**
 * 
 */
declare function once<A1, A2>(
	forces: ((a1: A1, a2: A2) => void) | ((a1: A1, a2: A2) => void)[],
	callback: (a1: A1, a2: A2, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent<[A1, A2]>;

/**
 * 
 */
declare function once<A1, A2, A3>(
	forces: ((a1: A1, a2: A2, a3: A3) => void) | ((a1: A1, a2: A2, a3: A3) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent<[A1, A2, A3]>;

/**
 * 
 */
declare function once<A1, A2, A3, A4>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent<[A1, A2, A3, A4]>;

/**
 * 
 */
declare function once<A1, A2, A3, A4, A5>(
	forces: ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent<[A1, A2, A3, A4, A5]>;

/**
 * 
 */
declare function once<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once<T>(
	forces: Reflex.Core.ArrayForce<T>,
	renderFn: (item: T) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.leaf,
	callback: (
		kind: Reflex.mutation.leafAdd | Reflex.mutation.leafRemove,
		text: Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.leafAdd,
	callback: (text: Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once(
	event: Reflex.mutation.leafRemove,
	callback: (text: Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

//# only() function declarations

/**
 * 
 */
declare function only<K extends keyof HTMLElementEventMap>(
	events: K | K[],
	callback: (ev: HTMLElementEventMap[K], e: HTMLElement) => Reflex.ML.Atom,
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only<A extends any[]>(
	forces: (...args: A) => void,
	callback: (...args: A) => Reflex.ML.Atom
): Reflex.Core.Recurrent<A>;

/**
 * 
 */
declare function only<T>(
	forces: Reflex.Core.StatefulForce<T> | Reflex.Core.StatefulForce<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation,
	callback: (kind: Reflex.mutation, node: HTMLElement | Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branch,
	callback: (
		kind: Reflex.mutation.branchAdd | Reflex.mutation.branchRemove,
		e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branchAdd,
	callback: (e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.branchRemove,
	callback: (e: HTMLElement) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.leaf,
	callback: (
		kind: Reflex.mutation.leafAdd | Reflex.mutation.leafRemove,
		text: Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.leafAdd,
	callback: (text: Text) => Reflex.ML.Atom
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function only(
	event: Reflex.mutation.leafRemove,
	callback: (text: Text) => Reflex.ML.Atom
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
declare function attach(...atoms: Reflex.ML.Atom[]): { 
	to: (target: Reflex.ML.Branch) => void;
};

declare namespace Reflex.ML
{
	export type Branch = HTMLElement;
	export type Leaf = Text;
	export type Atom = Core.Atom<Branch, Leaf, string>;
	
	/**
	 * Custom volatile types that atomize via ReflexML should implement
	 * this interface (explicitly or implicitly), rather than using the equivalent
	 * interface as defined in Reflex Core.
	 */
	export interface IVolatile extends Core.IVolatile<Branch, Leaf, string> { }
	
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
		
		/** Callable property that returns an <a> element with the atoms applied. */
		readonly a: ((...atoms: Atom[]) => HTMLAnchorElement) &
			Reflex.Core.BranchFunction<"a">;
		
		/** Callable property that returns an <abbr> element with the atoms applied. */
		readonly abbr: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"abbr">;
		
		/** Callable property that returns an <address> element with the atoms applied. */
		readonly address: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"address">;
		
		/** Callable property that returns an <area> element with the atoms applied. */
		readonly area: ((...atoms: Atom[]) => HTMLAreaElement) &
			Reflex.Core.BranchFunction<"area">;
		
		/** Callable property that returns an <article> element with the atoms applied. */
		readonly article: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"article">;
		
		/** Callable property that returns an <aside> element with the atoms applied. */
		readonly aside: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"aside">;
		
		/** Callable property that returns an <audio> element with the atoms applied. */
		readonly audio: ((...atoms: Atom[]) => HTMLAudioElement) &
			Reflex.Core.BranchFunction<"audio">;
		
		/** Callable property that returns a <b> element with the atoms applied. */
		readonly b: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"b">;
		
		/** Callable property that returns a <bdi> element with the atoms applied. */
		readonly bdi: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"bdi">;
		
		/** Callable property that returns a <bdo> element with the atoms applied. */
		readonly bdo: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"bdo">;
		
		/** Callable property that returns a <blockquote> element with the atoms applied. */
		readonly blockquote: ((...atoms: Atom[]) => HTMLQuoteElement) &
			Reflex.Core.BranchFunction<"blockquote">;
		
		/** Callable property that returns a <br> element with the atoms applied. */
		readonly br: ((...atoms: Atom[]) => HTMLBRElement) &
			Reflex.Core.BranchFunction<"br">;
		
		/** Callable property that returns a <button> element with the atoms applied. */
		readonly button: ((...atoms: Atom[]) => HTMLButtonElement) &
			Reflex.Core.BranchFunction<"button">;
		
		/** Callable property that returns a <canvas> element with the atoms applied. */
		readonly canvas: ((...atoms: Atom[]) => HTMLCanvasElement) &
			Reflex.Core.BranchFunction<"canvas">;
		
		/** Callable property that returns a <caption> element with the atoms applied. */
		readonly caption: ((...atoms: Atom[]) => HTMLTableCaptionElement) &
			Reflex.Core.BranchFunction<"caption">;
		
		/** Callable property that returns a <cite> element with the atoms applied. */
		readonly cite: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"cite">;
		
		/** Callable property that returns a <code> element with the atoms applied. */
		readonly code: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"code">;
		
		/** Callable property that returns a <col> element with the atoms applied. */
		readonly col: ((...atoms: Atom[]) => HTMLTableColElement) &
			Reflex.Core.BranchFunction<"col">;
		
		/** Callable property that returns a <colgroup> element with the atoms applied. */
		readonly colgroup: ((...atoms: Atom[]) => HTMLTableColElement) &
			Reflex.Core.BranchFunction<"colgroup">;
		
		/** Callable property that returns a <data> element with the atoms applied. */
		readonly data: ((...atoms: Atom[]) => HTMLDataElement) &
			Reflex.Core.BranchFunction<"data">;
		
		/** Callable property that returns a <datalist> element with the atoms applied. */
		readonly datalist: ((...atoms: Atom[]) => HTMLDataListElement) &
			Reflex.Core.BranchFunction<"datalist">;
		
		/** Callable property that returns a <dd> element with the atoms applied. */
		readonly dd: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dd">;
		
		/** Callable property that returns a <del> element with the atoms applied. */
		readonly del: ((...atoms: Atom[]) => HTMLModElement) &
			Reflex.Core.BranchFunction<"del">;
		
		/** Callable property that returns a <details> element with the atoms applied. */
		readonly details: ((...atoms: Atom[]) => HTMLDetailsElement) &
			Reflex.Core.BranchFunction<"details">;
		
		/** Callable property that returns a <dfn> element with the atoms applied. */
		readonly dfn: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dfn">;
		
		/** Callable property that returns a <dir> element with the atoms applied. */
		readonly dir: ((...atoms: Atom[]) => HTMLDirectoryElement) &
			Reflex.Core.BranchFunction<"dir">;
		
		/** Callable property that returns a <div> element with the atoms applied. */
		readonly div: ((...atoms: Atom[]) => HTMLDivElement) &
			Reflex.Core.BranchFunction<"div">;
		
		/** Callable property that returns a <dl> element with the atoms applied. */
		readonly dl: ((...atoms: Atom[]) => HTMLDListElement) &
			Reflex.Core.BranchFunction<"dl">;
		
		/** Callable property that returns a <dt> element with the atoms applied. */
		readonly dt: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"dt">;
		
		/** Callable property that returns a <em> element with the atoms applied. */
		readonly em: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"em">;
		
		/** Callable property that returns a <embed> element with the atoms applied. */
		readonly embed: ((...atoms: Atom[]) => HTMLEmbedElement) &
			Reflex.Core.BranchFunction<"embed">;
		
		/** Callable property that returns a <fieldset> element with the atoms applied. */
		readonly fieldset: ((...atoms: Atom[]) => HTMLFieldSetElement) &
			Reflex.Core.BranchFunction<"fieldset">;
		
		/** Callable property that returns a <figcaption> element with the atoms applied. */
		readonly figcaption: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"figcaption">;
		
		/** Callable property that returns a <figure> element with the atoms applied. */
		readonly figure: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"figure">;
		
		/** Callable property that returns a <footer> element with the atoms applied. */
		readonly footer: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"footer">;
		
		/** Callable property that returns a <form> element with the atoms applied. */
		readonly form: ((...atoms: Atom[]) => HTMLFormElement) &
			Reflex.Core.BranchFunction<"form">;
		
		/** Callable property that returns a <frame> element with the atoms applied. */
		readonly frame: ((...atoms: Atom[]) => HTMLFrameElement) &
			Reflex.Core.BranchFunction<"frame">;
		
		/** Callable property that returns a <frameset> element with the atoms applied. */
		readonly frameset: ((...atoms: Atom[]) => HTMLFrameSetElement) &
			Reflex.Core.BranchFunction<"frameset">;
		
		/** Callable property that returns an <h1> element with the atoms applied. */
		readonly h1: ((...atoms: Atom[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h1">;
		
		/** Callable property that returns an <h2> element with the atoms applied. */
		readonly h2: ((...atoms: Atom[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h2">;
		
		/** Callable property that returns an <h3> element with the atoms applied. */
		readonly h3: ((...atoms: Atom[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h3">;
		
		/** Callable property that returns an <h4> element with the atoms applied. */
		readonly h4: ((...atoms: Atom[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h4">;
		
		/** Callable property that returns an <h5> element with the atoms applied. */
		readonly h5: ((...atoms: Atom[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h5">;
		
		/** Callable property that returns an <h6> element with the atoms applied. */
		readonly h6: ((...atoms: Atom[]) => HTMLHeadingElement) &
			Reflex.Core.BranchFunction<"h6">;
		
		/** Callable property that returns a <header> element with the atoms applied. */
		readonly header: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"header">;
		
		/** Callable property that returns an <hgroup> element with the atoms applied. */
		readonly hgroup: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"hgroup">;
		
		/** Callable property that returns an <hr> element with the atoms applied. */
		readonly hr: ((...atoms: Atom[]) => HTMLHRElement) &
			Reflex.Core.BranchFunction<"hr">;
		
		/** Callable property that returns an <i> element with the atoms applied. */
		readonly i: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"i">;
		
		/** Callable property that returns an <iframe> element with the atoms applied. */
		readonly iframe: ((...atoms: Atom[]) => HTMLIFrameElement) &
			Reflex.Core.BranchFunction<"iframe">;
		
		/** Callable property that returns an <img> element with the atoms applied. */
		readonly img: ((...atoms: Atom[]) => HTMLImageElement) &
			Reflex.Core.BranchFunction<"img">;
		
		/** Callable property that returns an <ins> e**l>ement with the atoms applied. */
		readonly ins: ((...atoms: Atom[]) => HTMLModElement) &
			Reflex.Core.BranchFunction<"ins">;
		
		/** Callable property that returns a <kbd> element with the atoms applied. */
		readonly kbd: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"kbd">;
		
		/** Callable property that returns a <label> element with the atoms applied. */
		readonly label: ((...atoms: Atom[]) => HTMLLabelElement) &
			Reflex.Core.BranchFunction<"label">;
		
		/** Callable property that returns a <legend> element with the atoms applied. */
		readonly legend: ((...atoms: Atom[]) => HTMLLegendElement) &
			Reflex.Core.BranchFunction<"legend">;
		
		/** Callable property that returns an <li> element with the atoms applied. */
		readonly li: ((...atoms: Atom[]) => HTMLLIElement) &
			Reflex.Core.BranchFunction<"li">;
		
		/** Callable property that returns a <main> element with the atoms applied. */
		readonly main: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"main">;
		
		/** Callable property that returns a <map> element with the atoms applied. */
		readonly map: ((...atoms: Atom[]) => HTMLMapElement) &
			Reflex.Core.BranchFunction<"map">;
		
		/** Callable property that returns a <mark> element with the atoms applied. */
		readonly mark: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"mark">;
		
		/** Callable property that returns a <marquee> element with the atoms applied. */
		readonly marquee: ((...atoms: Atom[]) => HTMLMarqueeElement) &
			Reflex.Core.BranchFunction<"marquee">;
		
		/** Callable property that returns a <menu> element with the atoms applied. */
		readonly menu: ((...atoms: Atom[]) => HTMLMenuElement) &
			Reflex.Core.BranchFunction<"menu">;
		
		/** Callable property that returns a <meter> element with the atoms applied. */
		readonly meter: ((...atoms: Atom[]) => HTMLMeterElement) &
			Reflex.Core.BranchFunction<"meter">;
		
		/** Callable property that returns a <nav> element with the atoms applied. */
		readonly nav: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"nav">;
		
		/** Callable property that returns a <object> element with the atoms applied. */
		readonly object: ((...atoms: Atom[]) => HTMLObjectElement) &
			Reflex.Core.BranchFunction<"object">;
		
		/** Callable property that returns a <ol> element with the atoms applied. */
		readonly ol: ((...atoms: Atom[]) => HTMLOListElement) &
			Reflex.Core.BranchFunction<"ol">;
		
		/** Callable property that returns a <optgroup> element with the atoms applied. */
		readonly optgroup: ((...atoms: Atom[]) => HTMLOptGroupElement) &
			Reflex.Core.BranchFunction<"optgroup">;
		
		/** Callable property that returns a <option> element with the atoms applied. */
		readonly option: ((...atoms: Atom[]) => HTMLOptionElement) &
			Reflex.Core.BranchFunction<"option">;
		
		/** Callable property that returns a <output> element with the atoms applied. */
		readonly output: ((...atoms: Atom[]) => HTMLOutputElement) &
			Reflex.Core.BranchFunction<"output">;
		
		/** Callable property that returns a <p> element with the atoms applied. */
		readonly p: ((...atoms: Atom[]) => HTMLParagraphElement) &
			Reflex.Core.BranchFunction<"p">;
		
		/** Callable property that returns a <param> element with the atoms applied. */
		readonly param: ((...atoms: Atom[]) => HTMLParamElement) &
			Reflex.Core.BranchFunction<"param">;
		
		/** Callable property that returns a <picture> element with the atoms applied. */
		readonly picture: ((...atoms: Atom[]) => HTMLPictureElement) &
			Reflex.Core.BranchFunction<"picture">;
		
		/** Callable property that returns a <pre> element with the atoms applied. */
		readonly pre: ((...atoms: Atom[]) => HTMLPreElement) &
			Reflex.Core.BranchFunction<"pre">;
		
		/** Callable property that returns a <progress> element with the atoms applied. */
		readonly progress: ((...atoms: Atom[]) => HTMLProgressElement) &
			Reflex.Core.BranchFunction<"progress">;
		
		/** Callable property that returns a <q> element with the atoms applied. */
		readonly q: ((...atoms: Atom[]) => HTMLQuoteElement) &
			Reflex.Core.BranchFunction<"q">;
		
		/** Callable property that returns a <rp> element with the atoms applied. */
		readonly rp: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"rp">;
		
		/** Callable property that returns a <rt> element with the atoms applied. */
		readonly rt: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"rt">;
		
		/** Callable property that returns a <ruby> element with the atoms applied. */
		readonly ruby: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"ruby">;
		
		/** Callable property that returns a <s> element with the atoms applied. */
		readonly s: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"s">;
		
		/** Callable property that returns a <samp> element with the atoms applied. */
		readonly samp: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"samp">;
		
		/** Callable property that returns a <section> element with the atoms applied. */
		readonly section: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"section">;
		
		/** Callable property that returns a <select> element with the atoms applied. */
		readonly select: ((...atoms: Atom[]) => HTMLSelectElement) &
			Reflex.Core.BranchFunction<"select">;
		
		/** Callable property that returns a <slot> element with the atoms applied. */
		readonly slot: ((...atoms: Atom[]) => HTMLSlotElement) &
			Reflex.Core.BranchFunction<"slot">;
		
		/** Callable property that returns a <small> element with the atoms applied. */
		readonly small: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"small">;
		
		/** Callable property that returns a <source> element with the atoms applied. */
		readonly source: ((...atoms: Atom[]) => HTMLSourceElement) &
			Reflex.Core.BranchFunction<"source">;
		
		/** Callable property that returns a <span> element with the atoms applied. */
		readonly span: ((...atoms: Atom[]) => HTMLSpanElement) &
			Reflex.Core.BranchFunction<"span">;
		
		/** Callable property that returns a <strong> element with the atoms applied. */
		readonly strong: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"strong">;
		
		/** Callable property that returns a <sub> element with the atoms applied. */
		readonly sub: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"sub">;
		
		/** Callable property that returns a <summary> element with the atoms applied. */
		readonly summary: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"summary">;
		
		/** Callable property that returns a <sup> element with the atoms applied. */
		readonly sup: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"sup">;
		
		/** Callable property that returns a <table> element with the atoms applied. */
		readonly table: ((...atoms: Atom[]) => HTMLTableElement) &
			Reflex.Core.BranchFunction<"table">;
		
		/** Callable property that returns a <tbody> element with the atoms applied. */
		readonly tbody: ((...atoms: Atom[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"tbody">;
		
		/** Callable property that returns a <td> element with the atoms applied. */
		readonly td: ((...atoms: Atom[]) => HTMLTableDataCellElement) &
			Reflex.Core.BranchFunction<"td">;
		
		/** Callable property that returns a <template> element with the atoms applied. */
		readonly template: ((...atoms: Atom[]) => HTMLTemplateElement) &
			Reflex.Core.BranchFunction<"template">;
		
		/** Callable property that returns a <textarea> element with the atoms applied. */
		readonly textarea: ((...atoms: Atom[]) => HTMLTextAreaElement) &
			Reflex.Core.BranchFunction<"textarea">;
		
		/** Callable property that returns a <tfoot> element with the atoms applied. */
		readonly tfoot: ((...atoms: Atom[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"tfoot">;
		
		/** Callable property that returns a <th> element with the atoms applied. */
		readonly th: ((...atoms: Atom[]) => HTMLTableHeaderCellElement) &
			Reflex.Core.BranchFunction<"th">;
		
		/** Callable property that returns a <thead> element with the atoms applied. */
		readonly thead: ((...atoms: Atom[]) => HTMLTableSectionElement) &
			Reflex.Core.BranchFunction<"thead">;
		
		/** Callable property that returns a <time> element with the atoms applied. */
		readonly time: ((...atoms: Atom[]) => HTMLTimeElement) &
			Reflex.Core.BranchFunction<"time">;
		
		/** Callable property that returns a <tr> element with the atoms applied. */
		readonly tr: ((...atoms: Atom[]) => HTMLTableRowElement) &
			Reflex.Core.BranchFunction<"tr">;
		
		/** Callable property that returns a <track> element with the atoms applied. */
		readonly track: ((...atoms: Atom[]) => HTMLTrackElement) &
			Reflex.Core.BranchFunction<"track">;
		
		/** Callable property that returns a <u> element with the atoms applied. */
		readonly u: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"u">;
		
		/** Callable property that returns a <ul> element with the atoms applied. */
		readonly ul: ((...atoms: Atom[]) => HTMLUListElement) &
			Reflex.Core.BranchFunction<"ul">;
		
		/** Callable property that returns a <var> element with the atoms applied. */
		readonly var: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"var">;
		
		/** Callable property that returns a <video> element with the atoms applied. */
		readonly video: ((...atoms: Atom[]) => HTMLVideoElement) &
			Reflex.Core.BranchFunction<"video">;
		
		/** Callable property that returns a <wbr> element with the atoms applied. */
		readonly wbr: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"wbr">;
		
		//# <input> Elements
		
		/** Callable property that returns an <input type="button"> element with the atoms applied. */
		readonly inputButton: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="checkbox"> element with the atoms applied. */
		readonly inputCheckbox: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="color"> element with the atoms applied. */
		readonly inputColor: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="date"> element with the atoms applied. */
		readonly inputDate: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="datetime"> element with the atoms applied. */
		readonly inputDatetime: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="datetime-local"> element with the atoms applied. */
		readonly inputDatetimeLocal: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="email"> element with the atoms applied. */
		readonly inputEmail: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="file"> element with the atoms applied. */
		readonly inputFile: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="hidden"> element with the atoms applied. */
		readonly inputHidden: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="image"> element with the atoms applied. */
		readonly inputImage: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="month"> element with the atoms applied. */
		readonly inputMonth: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="number"> element with the atoms applied. */
		readonly inputNumber: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="password"> element with the atoms applied. */
		readonly inputPassword: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="radio"> element with the atoms applied. */
		readonly inputRadio: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="range"> element with the atoms applied. */
		readonly inputRange: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="reset"> element with the atoms applied. */
		readonly inputReset: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="search"> element with the atoms applied. */
		readonly inputSearch: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="submit"> element with the atoms applied. */
		readonly inputSubmit: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="tel"> element with the atoms applied. */
		readonly inputTel: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="text"> element with the atoms applied. */
		readonly inputText: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="time"> element with the atoms applied. */
		readonly inputTime: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="url"> element with the atoms applied. */
		readonly inputUrl: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		/** Callable property that returns an <input type="week"> element with the atoms applied. */
		readonly inputWeek: ((...atoms: Atom[]) => HTMLInputElement) &
			Reflex.Core.BranchFunction<"input">;
		
		//# Non-Visual Elements
		
		/** Callable property that returns an <html> element with the atoms applied. */
		readonly html: ((...atoms: Atom[]) => HTMLHtmlElement) &
			Reflex.Core.BranchFunction<"html">;
		
		/** Callable property that returns an <head> element with the atoms applied. */
		readonly head: ((...atoms: Atom[]) => HTMLHeadElement) &
			Reflex.Core.BranchFunction<"head">;
		
		/** Callable property that returns a <body> element with the atoms applied. */
		readonly body: ((...atoms: Atom[]) => HTMLBodyElement) &
			Reflex.Core.BranchFunction<"body">;
		
		/** Callable property that returns a <meta> element with the atoms applied. */
		readonly meta: ((...atoms: Atom[]) => HTMLMetaElement) &
			Reflex.Core.BranchFunction<"meta">;
		
		/** Callable property that returns an <link> element with the atoms applied. */
		readonly link: ((...atoms: Atom[]) => HTMLLinkElement) &
			Reflex.Core.BranchFunction<"link">;
		
		/** Callable property that returns a <style> element with the atoms applied. */
		readonly style: ((...atoms: Atom[]) => HTMLStyleElement) &
			Reflex.Core.BranchFunction<"style">;
		
		/** Callable property that returns a <script> element with the atoms applied. */
		readonly script: ((...atoms: Atom[]) => HTMLScriptElement) &
			Reflex.Core.BranchFunction<"script">;
		
		/** Callable property that returns a <noscript> element with the atoms applied. */
		readonly noscript: ((...atoms: Atom[]) => HTMLElement) &
			Reflex.Core.BranchFunction<"noscript">;
		
		/** Callable property that returns a <base> element with the atoms applied. */
		readonly base: ((...atoms: Atom[]) => HTMLBaseElement) &
			Reflex.Core.BranchFunction<"base">;
		
		/** Callable property that returns a <basefont> element with the atoms applied. */
		readonly basefont: ((...atoms: Atom[]) => HTMLBaseFontElement) &
			Reflex.Core.BranchFunction<"basefont">;
	}
}
