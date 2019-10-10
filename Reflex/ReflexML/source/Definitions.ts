
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
		
		/** Returns a <a> element with the primitives applied. */
		a(...primitives: Primitives[]): HTMLAnchorElement;
		
		/** Returns a <abbr> element with the primitives applied. */
		abbr(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <address> element with the primitives applied. */
		address(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <area> element with the primitives applied. */
		area(...primitives: Primitives[]): HTMLAreaElement;
		
		/** Returns a <article> element with the primitives applied. */
		article(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <aside> element with the primitives applied. */
		aside(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <audio> element with the primitives applied. */
		audio(...primitives: Primitives[]): HTMLAudioElement;
		
		/** Returns a <b> element with the primitives applied. */
		b(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <bdi> element with the primitives applied. */
		bdi(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <bdo> element with the primitives applied. */
		bdo(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <blockquote> element with the primitives applied. */
		blockquote(...primitives: Primitives[]): HTMLQuoteElement;
		
		/** Returns a <br> element with the primitives applied. */
		br(...primitives: Primitives[]): HTMLBRElement;
		
		/** Returns a <button> element with the primitives applied. */
		button(...primitives: Primitives[]): HTMLButtonElement;
		
		/** Returns a <canvas> element with the primitives applied. */
		canvas(...primitives: Primitives[]): HTMLCanvasElement;
		
		/** Returns a <caption> element with the primitives applied. */
		caption(...primitives: Primitives[]): HTMLTableCaptionElement;
		
		/** Returns a <cite> element with the primitives applied. */
		cite(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <code> element with the primitives applied. */
		code(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <col> element with the primitives applied. */
		col(...primitives: Primitives[]): HTMLTableColElement;
		
		/** Returns a <colgroup> element with the primitives applied. */
		colgroup(...primitives: Primitives[]): HTMLTableColElement;
		
		/** Returns a <data> element with the primitives applied. */
		data(...primitives: Primitives[]): HTMLDataElement;
		
		/** Returns a <datalist> element with the primitives applied. */
		datalist(...primitives: Primitives[]): HTMLDataListElement;
		
		/** Returns a <dd> element with the primitives applied. */
		dd(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <del> element with the primitives applied. */
		del(...primitives: Primitives[]): HTMLModElement;
		
		/** Returns a <details> element with the primitives applied. */
		details(...primitives: Primitives[]): HTMLDetailsElement;
		
		/** Returns a <dfn> element with the primitives applied. */
		dfn(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <dir> element with the primitives applied. */
		dir(...primitives: Primitives[]): HTMLDirectoryElement;
		
		/** Returns a <div> element with the primitives applied. */
		div(...primitives: Primitives[]): HTMLDivElement;
		
		/** Returns a <dl> element with the primitives applied. */
		dl(...primitives: Primitives[]): HTMLDListElement;
		
		/** Returns a <dt> element with the primitives applied. */
		dt(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <em> element with the primitives applied. */
		em(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <embed> element with the primitives applied. */
		embed(...primitives: Primitives[]): HTMLEmbedElement;
		
		/** Returns a <fieldset> element with the primitives applied. */
		fieldset(...primitives: Primitives[]): HTMLFieldSetElement;
		
		/** Returns a <figcaption> element with the primitives applied. */
		figcaption(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <figure> element with the primitives applied. */
		figure(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <footer> element with the primitives applied. */
		footer(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <form> element with the primitives applied. */
		form(...primitives: Primitives[]): HTMLFormElement;
		
		/** Returns a <frame> element with the primitives applied. */
		frame(...primitives: Primitives[]): HTMLFrameElement;
		
		/** Returns a <frameset> element with the primitives applied. */
		frameset(...primitives: Primitives[]): HTMLFrameSetElement;
		
		/** Returns an <h1> element with the primitives applied. */
		h1(...primitives: Primitives[]): HTMLHeadingElement;
		
		/** Returns an <h2> element with the primitives applied. */
		h2(...primitives: Primitives[]): HTMLHeadingElement;
		
		/** Returns an <h3> element with the primitives applied. */
		h3(...primitives: Primitives[]): HTMLHeadingElement;
		
		/** Returns an <h4> element with the primitives applied. */
		h4(...primitives: Primitives[]): HTMLHeadingElement;
		
		/** Returns an <h5> element with the primitives applied. */
		h5(...primitives: Primitives[]): HTMLHeadingElement;
		
		/** Returns an <h6> element with the primitives applied. */
		h6(...primitives: Primitives[]): HTMLHeadingElement;
		
		/** Returns a <head> element with the primitives applied. */
		head(...primitives: Primitives[]): HTMLHeadElement;
		
		/** Returns a <header> element with the primitives applied. */
		header(...primitives: Primitives[]): HTMLElement;
		
		/** Returns an <hgroup> element with the primitives applied. */
		hgroup(...primitives: Primitives[]): HTMLElement;
		
		/** Returns an <hr> element with the primitives applied. */
		hr(...primitives: Primitives[]): HTMLHRElement;
		
		/** Returns a <i> element with the primitives applied. */
		i(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <iframe> element with the primitives applied. */
		iframe(...primitives: Primitives[]): HTMLIFrameElement;
		
		/** Returns a <img> element with the primitives applied. */
		img(...primitives: Primitives[]): HTMLImageElement;
		
		/** Returns an <ins> e**l>ement with the primitives applied. */
		ins(...primitives: Primitives[]): HTMLModElement;
		
		/** Returns a <kbd> element with the primitives applied. */
		kbd(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <label> element with the primitives applied. */
		label(...primitives: Primitives[]): HTMLLabelElement;
		
		/** Returns a <legend> element with the primitives applied. */
		legend(...primitives: Primitives[]): HTMLLegendElement;
		
		/** Returns an <li> element with the primitives applied. */
		li(...primitives: Primitives[]): HTMLLIElement;
		
		/** Returns a <main> element with the primitives applied. */
		main(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <map> element with the primitives applied. */
		map(...primitives: Primitives[]): HTMLMapElement;
		
		/** Returns a <mark> element with the primitives applied. */
		mark(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <marquee> element with the primitives applied. */
		marquee(...primitives: Primitives[]): HTMLMarqueeElement;
		
		/** Returns a <menu> element with the primitives applied. */
		menu(...primitives: Primitives[]): HTMLMenuElement;
		
		/** Returns a <meter> element with the primitives applied. */
		meter(...primitives: Primitives[]): HTMLMeterElement;
		
		/** Returns a <nav> element with the primitives applied. */
		nav(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <object> element with the primitives applied. */
		object(...primitives: Primitives[]): HTMLObjectElement;
		
		/** Returns a <ol> element with the primitives applied. */
		ol(...primitives: Primitives[]): HTMLOListElement;
		
		/** Returns a <optgroup> element with the primitives applied. */
		optgroup(...primitives: Primitives[]): HTMLOptGroupElement;
		
		/** Returns a <option> element with the primitives applied. */
		option(...primitives: Primitives[]): HTMLOptionElement;
		
		/** Returns a <output> element with the primitives applied. */
		output(...primitives: Primitives[]): HTMLOutputElement;
		
		/** Returns a <p> element with the primitives applied. */
		p(...primitives: Primitives[]): HTMLParagraphElement;
		
		/** Returns a <param> element with the primitives applied. */
		param(...primitives: Primitives[]): HTMLParamElement;
		
		/** Returns a <picture> element with the primitives applied. */
		picture(...primitives: Primitives[]): HTMLPictureElement;
		
		/** Returns a <pre> element with the primitives applied. */
		pre(...primitives: Primitives[]): HTMLPreElement;
		
		/** Returns a <progress> element with the primitives applied. */
		progress(...primitives: Primitives[]): HTMLProgressElement;
		
		/** Returns a <q> element with the primitives applied. */
		q(...primitives: Primitives[]): HTMLQuoteElement;
		
		/** Returns a <rp> element with the primitives applied. */
		rp(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <rt> element with the primitives applied. */
		rt(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <ruby> element with the primitives applied. */
		ruby(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <s> element with the primitives applied. */
		s(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <samp> element with the primitives applied. */
		samp(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <section> element with the primitives applied. */
		section(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <select> element with the primitives applied. */
		select(...primitives: Primitives[]): HTMLSelectElement;
		
		/** Returns a <slot> element with the primitives applied. */
		slot(...primitives: Primitives[]): HTMLSlotElement;
		
		/** Returns a <small> element with the primitives applied. */
		small(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <source> element with the primitives applied. */
		source(...primitives: Primitives[]): HTMLSourceElement;
		
		/** Returns a <span> element with the primitives applied. */
		span(...primitives: Primitives[]): HTMLSpanElement;
		
		/** Returns a <strong> element with the primitives applied. */
		strong(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <sub> element with the primitives applied. */
		sub(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <summary> element with the primitives applied. */
		summary(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <sup> element with the primitives applied. */
		sup(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <table> element with the primitives applied. */
		table(...primitives: Primitives[]): HTMLTableElement;
		
		/** Returns a <tbody> element with the primitives applied. */
		tbody(...primitives: Primitives[]): HTMLTableSectionElement;
		
		/** Returns a <td> element with the primitives applied. */
		td(...primitives: Primitives[]): HTMLTableDataCellElement;
		
		/** Returns a <template> element with the primitives applied. */
		template(...primitives: Primitives[]): HTMLTemplateElement;
		
		/** Returns a <textarea> element with the primitives applied. */
		textarea(...primitives: Primitives[]): HTMLTextAreaElement;
		
		/** Returns a <tfoot> element with the primitives applied. */
		tfoot(...primitives: Primitives[]): HTMLTableSectionElement;
		
		/** Returns a <th> element with the primitives applied. */
		th(...primitives: Primitives[]): HTMLTableHeaderCellElement;
		
		/** Returns a <thead> element with the primitives applied. */
		thead(...primitives: Primitives[]): HTMLTableSectionElement;
		
		/** Returns a <time> element with the primitives applied. */
		time(...primitives: Primitives[]): HTMLTimeElement;
		
		/** Returns a <tr> element with the primitives applied. */
		tr(...primitives: Primitives[]): HTMLTableRowElement;
		
		/** Returns a <track> element with the primitives applied. */
		track(...primitives: Primitives[]): HTMLTrackElement;
		
		/** Returns a <u> element with the primitives applied. */
		u(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <ul> element with the primitives applied. */
		ul(...primitives: Primitives[]): HTMLUListElement;
		
		/** Returns a <var> element with the primitives applied. */
		var(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <video> element with the primitives applied. */
		video(...primitives: Primitives[]): HTMLVideoElement;
		
		/** Returns a <wbr> element with the primitives applied. */
		wbr(...primitives: Primitives[]): HTMLElement;
		
		//# <input> Elements
		
		/** Returns an <input type="button"> element with the primitives applied. */
		inputButton(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="checkbox"> element with the primitives applied. */
		inputCheckbox(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="color"> element with the primitives applied. */
		inputColor(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="date"> element with the primitives applied. */
		inputDate(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="datetime"> element with the primitives applied. */
		inputDatetime(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="datetime-local"> element with the primitives applied. */
		inputDatetimeLocal(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="email"> element with the primitives applied. */
		inputEmail(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="file"> element with the primitives applied. */
		inputFile(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="hidden"> element with the primitives applied. */
		inputHidden(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="image"> element with the primitives applied. */
		inputImage(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="month"> element with the primitives applied. */
		inputMonth(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="number"> element with the primitives applied. */
		inputNumber(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="password"> element with the primitives applied. */
		inputPassword(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="radio"> element with the primitives applied. */
		inputRadio(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="range"> element with the primitives applied. */
		inputRange(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="reset"> element with the primitives applied. */
		inputReset(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="search"> element with the primitives applied. */
		inputSearch(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="submit"> element with the primitives applied. */
		inputSubmit(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="tel"> element with the primitives applied. */
		inputTel(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="text"> element with the primitives applied. */
		inputText(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="time"> element with the primitives applied. */
		inputTime(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="url"> element with the primitives applied. */
		inputUrl(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="week"> element with the primitives applied. */
		inputWeek(...primitives: Primitives[]): HTMLInputElement;
		
		//# Non-Visual Elements
		
		/** Returns an <html> element with the primitives applied. */
		html(...primitives: Primitives[]): HTMLHtmlElement;
		
		/** Returns an <head> element with the primitives applied. */
		head(...primitives: Primitives[]): HTMLHeadElement;
		
		/** Returns a <body> element with the primitives applied. */
		body(...primitives: Primitives[]): HTMLBodyElement;
		
		/** Returns a <meta> element with the primitives applied. */
		meta(...primitives: Primitives[]): HTMLMetaElement;
		
		/** Returns an <link> element with the primitives applied. */
		link(...primitives: Primitives[]): HTMLLinkElement;
		
		/** Returns a <style> element with the primitives applied. */
		style(...primitives: Primitives[]): HTMLStyleElement;
		
		/** Returns a <script> element with the primitives applied. */
		script(...primitives: Primitives[]): HTMLScriptElement;
		
		/** Returns a <noscript> element with the primitives applied. */
		noscript(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <base> element with the primitives applied. */
		base(...primitives: Primitives[]): HTMLBaseElement;
		
		/** Returns a <basefont> element with the primitives applied. */
		basefont(...primitives: Primitives[]): HTMLBaseFontElement;
	}
}
