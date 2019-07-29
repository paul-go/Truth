
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
	reflexes: (() => void) | (() => void)[],
	callback: (e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on<A1>(
	reflexes: ((a1: A1) => void) | ((a1: A1) => void)[],
	callback: (a1: A1, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1]>;

/**
 * 
 */
declare function on<A1, A2>(
	reflexes: ((a1: A1, a2: A2) => void) | ((a1: A1, a2: A2) => void)[],
	callback: (a1: A1, a2: A2, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2]>;

/**
 * 
 */
declare function on<A1, A2, A3>(
	reflexes: ((a1: A1, a2: A2, a3: A3) => void) | ((a1: A1, a2: A2, a3: A3) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3]>;

/**
 * 
 */
declare function on<A1, A2, A3, A4>(
	reflexes: ((a1: A1, a2: A2, a3: A3, a4: A4) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3, A4]>;

/**
 * 
 */
declare function on<A1, A2, A3, A4, A5>(
	reflexes: ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3, A4, A5]>;

/**
 * 
 */
declare function on<T>(
	reflexes: Reflex.Core.StatefulReflex<T> | Reflex.Core.StatefulReflex<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function on<T>(
	effectArray: Reflex.Core.ArrayReflex<T>,
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
	reflexes: (() => void) | (() => void)[],
	callback: (e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once<A1>(
	reflexes: ((a1: A1) => void) | ((a1: A1) => void)[],
	callback: (a1: A1, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1]>;

/**
 * 
 */
declare function once<A1, A2>(
	reflexes: ((a1: A1, a2: A2) => void) | ((a1: A1, a2: A2) => void)[],
	callback: (a1: A1, a2: A2, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2]>;

/**
 * 
 */
declare function once<A1, A2, A3>(
	reflexes: ((a1: A1, a2: A2, a3: A3) => void) | ((a1: A1, a2: A2, a3: A3) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3]>;

/**
 * 
 */
declare function once<A1, A2, A3, A4>(
	reflexes: ((a1: A1, a2: A2, a3: A3, a4: A4) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3, A4]>;

/**
 * 
 */
declare function once<A1, A2, A3, A4, A5>(
	reflexes: ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void) | ((a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => void)[],
	callback: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<[A1, A2, A3, A4, A5]>;

/**
 * 
 */
declare function once<T>(
	reflexes: Reflex.Core.StatefulReflex<T> | Reflex.Core.StatefulReflex<T>[],
	callback: (now: T, was: T, e: HTMLElement) => Reflex.ML.Primitives
): Reflex.Core.Recurrent;

/**
 * 
 */
declare function once<T>(
	reflexes: Reflex.Core.ArrayReflex<T>,
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
	reflexes: (...args: A) => void,
	callback: (...args: A) => Reflex.ML.Primitives
): Reflex.Core.Recurrent<A>;

/**
 * 
 */
declare function only<T>(
	reflexes: Reflex.Core.StatefulReflex<T> | Reflex.Core.StatefulReflex<T>[],
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
	to: (target: Reflex.ML.Branch) => void
};

declare namespace Reflex.ML
{
	export type Node = HTMLElement | Text;
	export type Branch = HTMLElement;
	export type Primitive = Core.Primitive<Node, Branch, string>;
	export type Primitives = Core.Primitives<Node, Branch, string>;
	
	export interface Namespace extends Core.INamespace
		<Text, Text | string | number | bigint>
	{
		//# Static Members
		
		/**
		 * Causes the connected HTMLElement to be data-bound to the
		 * specified effect variable.
		 * 
		 * Uses the effect variable's .value prorpety when connected to an
		 * HTMLInputElement, otherwise, the .textContent property is used.
		 */
		bind<T extends string | number | bigint>(effectVariable: Reflex.Core.StatefulReflex<T>): void;
		
		//# HTML Elements
		
		/** Returns a <a> element with the arguments applied. */
		a(...primitives: Primitives[]): HTMLAnchorElement;
		
		/** Returns a <abbr> element with the arguments applied. */
		abbr(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <address> element with the arguments applied. */
		address(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <area> element with the arguments applied. */
		area(...primitives: Primitives[]): HTMLAreaElement;
		
		/** Returns a <article> element with the arguments applied. */
		article(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <aside> element with the arguments applied. */
		aside(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <audio> element with the arguments applied. */
		audio(...primitives: Primitives[]): HTMLAudioElement;
		
		/** Returns a <b> element with the arguments applied. */
		b(...primitives: Primitives[]): HTMLElement;
		
		/** Returns a <base> element with the arguments applied. */
		base(...primitives: Primitives[]): HTMLBaseElement;
		
		/** Returns a <basefont> element with the arguments applied. */
		basefont(...primitives: Primitives[]): HTMLBaseFontElement;
		
		/** Returns a <bdi> element with the arguments applied. */
		bdi(...primitives: Primitives[]): HTMLElement;

		/** Returns a <bdo> element with the arguments applied. */
		bdo(...primitives: Primitives[]): HTMLElement;

		/** Returns a <blockquote> element with the arguments applied. */
		blockquote(...primitives: Primitives[]): HTMLQuoteElement;

		/** Returns a <br> element with the arguments applied. */
		br(...primitives: Primitives[]): HTMLBRElement;

		/** Returns a <button> element with the arguments applied. */
		button(...primitives: Primitives[]): HTMLButtonElement;
		
		/** Returns a <canvas> element with the arguments applied. */
		canvas(...primitives: Primitives[]): HTMLCanvasElement;

		/** Returns a <caption> element with the arguments applied. */
		caption(...primitives: Primitives[]): HTMLTableCaptionElement;

		/** Returns a <cite> element with the arguments applied. */
		cite(...primitives: Primitives[]): HTMLElement;

		/** Returns a <code> element with the arguments applied. */
		code(...primitives: Primitives[]): HTMLElement;

		/** Returns a <col> element with the arguments applied. */
		col(...primitives: Primitives[]): HTMLTableColElement;

		/** Returns a <colgroup> element with the arguments applied. */
		colgroup(...primitives: Primitives[]): HTMLTableColElement;

		/** Returns a <data> element with the arguments applied. */
		data(...primitives: Primitives[]): HTMLDataElement;

		/** Returns a <datalist> element with the arguments applied. */
		datalist(...primitives: Primitives[]): HTMLDataListElement;

		/** Returns a <dd> element with the arguments applied. */
		dd(...primitives: Primitives[]): HTMLElement;

		/** Returns a <del> element with the arguments applied. */
		del(...primitives: Primitives[]): HTMLModElement;

		/** Returns a <details> element with the arguments applied. */
		details(...primitives: Primitives[]): HTMLDetailsElement;

		/** Returns a <dfn> element with the arguments applied. */
		dfn(...primitives: Primitives[]): HTMLElement;

		/** Returns a <dir> element with the arguments applied. */
		dir(...primitives: Primitives[]): HTMLDirectoryElement;

		/** Returns a <div> element with the arguments applied. */
		div(...primitives: Primitives[]): HTMLDivElement;
		
		/** Returns a <dl> element with the arguments applied. */
		dl(...primitives: Primitives[]): HTMLDListElement;

		/** Returns a <dt> element with the arguments applied. */
		dt(...primitives: Primitives[]): HTMLElement;

		/** Returns a <em> element with the arguments applied. */
		em(...primitives: Primitives[]): HTMLElement;

		/** Returns a <embed> element with the arguments applied. */
		embed(...primitives: Primitives[]): HTMLEmbedElement;

		/** Returns a <fieldset> element with the arguments applied. */
		fieldset(...primitives: Primitives[]): HTMLFieldSetElement;

		/** Returns a <figcaption> element with the arguments applied. */
		figcaption(...primitives: Primitives[]): HTMLElement;

		/** Returns a <figure> element with the arguments applied. */
		figure(...primitives: Primitives[]): HTMLElement;

		/** Returns a <footer> element with the arguments applied. */
		footer(...primitives: Primitives[]): HTMLElement;

		/** Returns a <form> element with the arguments applied. */
		form(...primitives: Primitives[]): HTMLFormElement;

		/** Returns a <frame> element with the arguments applied. */
		frame(...primitives: Primitives[]): HTMLFrameElement;

		/** Returns a <frameset> element with the arguments applied. */
		frameset(...primitives: Primitives[]): HTMLFrameSetElement;

		/** Returns a <h1> element with the arguments applied. */
		h1(...primitives: Primitives[]): HTMLHeadingElement;

		/** Returns a <h2> element with the arguments applied. */
		h2(...primitives: Primitives[]): HTMLHeadingElement;

		/** Returns a <h3> element with the arguments applied. */
		h3(...primitives: Primitives[]): HTMLHeadingElement;

		/** Returns a <h4> element with the arguments applied. */
		h4(...primitives: Primitives[]): HTMLHeadingElement;

		/** Returns a <h5> element with the arguments applied. */
		h5(...primitives: Primitives[]): HTMLHeadingElement;

		/** Returns a <h6> element with the arguments applied. */
		h6(...primitives: Primitives[]): HTMLHeadingElement;

		/** Returns a <header> element with the arguments applied. */
		header(...primitives: Primitives[]): HTMLElement;

		/** Returns a <hgroup> element with the arguments applied. */
		hgroup(...primitives: Primitives[]): HTMLElement;

		/** Returns a <hr> element with the arguments applied. */
		hr(...primitives: Primitives[]): HTMLHRElement;

		/** Returns a <i> element with the arguments applied. */
		i(...primitives: Primitives[]): HTMLElement;

		/** Returns a <iframe> element with the arguments applied. */
		iframe(...primitives: Primitives[]): HTMLIFrameElement;

		/** Returns a <img> element with the arguments applied. */
		img(...primitives: Primitives[]): HTMLImageElement;

		/** Returns a <ins> e**l>ement with the arguments applied. */
		ins(...primitives: Primitives[]): HTMLModElement;

		/** Returns a <kbd> element with the arguments applied. */
		kbd(...primitives: Primitives[]): HTMLElement;

		/** Returns a <label> element with the arguments applied. */
		label(...primitives: Primitives[]): HTMLLabelElement;

		/** Returns a <legend> element with the arguments applied. */
		legend(...primitives: Primitives[]): HTMLLegendElement;

		/** Returns a <li> element with the arguments applied. */
		li(...primitives: Primitives[]): HTMLLIElement;

		/** Returns a <main> element with the arguments applied. */
		main(...primitives: Primitives[]): HTMLElement;

		/** Returns a <map> element with the arguments applied. */
		map(...primitives: Primitives[]): HTMLMapElement;

		/** Returns a <mark> element with the arguments applied. */
		mark(...primitives: Primitives[]): HTMLElement;

		/** Returns a <marquee> element with the arguments applied. */
		marquee(...primitives: Primitives[]): HTMLMarqueeElement;

		/** Returns a <menu> element with the arguments applied. */
		menu(...primitives: Primitives[]): HTMLMenuElement;

		/** Returns a <meter> element with the arguments applied. */
		meter(...primitives: Primitives[]): HTMLMeterElement;

		/** Returns a <nav> element with the arguments applied. */
		nav(...primitives: Primitives[]): HTMLElement;

		/** Returns a <object> element with the arguments applied. */
		object(...primitives: Primitives[]): HTMLObjectElement;

		/** Returns a <ol> element with the arguments applied. */
		ol(...primitives: Primitives[]): HTMLOListElement;

		/** Returns a <optgroup> element with the arguments applied. */
		optgroup(...primitives: Primitives[]): HTMLOptGroupElement;

		/** Returns a <option> element with the arguments applied. */
		option(...primitives: Primitives[]): HTMLOptionElement;

		/** Returns a <output> element with the arguments applied. */
		output(...primitives: Primitives[]): HTMLOutputElement;

		/** Returns a <p> element with the arguments applied. */
		p(...primitives: Primitives[]): HTMLParagraphElement;

		/** Returns a <param> element with the arguments applied. */
		param(...primitives: Primitives[]): HTMLParamElement;

		/** Returns a <picture> element with the arguments applied. */
		picture(...primitives: Primitives[]): HTMLPictureElement;

		/** Returns a <pre> element with the arguments applied. */
		pre(...primitives: Primitives[]): HTMLPreElement;

		/** Returns a <progress> element with the arguments applied. */
		progress(...primitives: Primitives[]): HTMLProgressElement;

		/** Returns a <q> element with the arguments applied. */
		q(...primitives: Primitives[]): HTMLQuoteElement;

		/** Returns a <rp> element with the arguments applied. */
		rp(...primitives: Primitives[]): HTMLElement;

		/** Returns a <rt> element with the arguments applied. */
		rt(...primitives: Primitives[]): HTMLElement;

		/** Returns a <ruby> element with the arguments applied. */
		ruby(...primitives: Primitives[]): HTMLElement;

		/** Returns a <s> element with the arguments applied. */
		s(...primitives: Primitives[]): HTMLElement;

		/** Returns a <samp> element with the arguments applied. */
		samp(...primitives: Primitives[]): HTMLElement;

		/** Returns a <section> element with the arguments applied. */
		section(...primitives: Primitives[]): HTMLElement;

		/** Returns a <select> element with the arguments applied. */
		select(...primitives: Primitives[]): HTMLSelectElement;

		/** Returns a <slot> element with the arguments applied. */
		slot(...primitives: Primitives[]): HTMLSlotElement;

		/** Returns a <small> element with the arguments applied. */
		small(...primitives: Primitives[]): HTMLElement;

		/** Returns a <source> element with the arguments applied. */
		source(...primitives: Primitives[]): HTMLSourceElement;

		/** Returns a <span> element with the arguments applied. */
		span(...primitives: Primitives[]): HTMLSpanElement;

		/** Returns a <strong> element with the arguments applied. */
		strong(...primitives: Primitives[]): HTMLElement;

		/** Returns a <sub> element with the arguments applied. */
		sub(...primitives: Primitives[]): HTMLElement;

		/** Returns a <summary> element with the arguments applied. */
		summary(...primitives: Primitives[]): HTMLElement;

		/** Returns a <sup> element with the arguments applied. */
		sup(...primitives: Primitives[]): HTMLElement;

		/** Returns a <table> element with the arguments applied. */
		table(...primitives: Primitives[]): HTMLTableElement;

		/** Returns a <tbody> element with the arguments applied. */
		tbody(...primitives: Primitives[]): HTMLTableSectionElement;

		/** Returns a <td> element with the arguments applied. */
		td(...primitives: Primitives[]): HTMLTableDataCellElement;

		/** Returns a <template> element with the arguments applied. */
		template(...primitives: Primitives[]): HTMLTemplateElement;

		/** Returns a <textarea> element with the arguments applied. */
		textarea(...primitives: Primitives[]): HTMLTextAreaElement;

		/** Returns a <tfoot> element with the arguments applied. */
		tfoot(...primitives: Primitives[]): HTMLTableSectionElement;

		/** Returns a <th> element with the arguments applied. */
		th(...primitives: Primitives[]): HTMLTableHeaderCellElement;

		/** Returns a <thead> element with the arguments applied. */
		thead(...primitives: Primitives[]): HTMLTableSectionElement;

		/** Returns a <time> element with the arguments applied. */
		time(...primitives: Primitives[]): HTMLTimeElement;

		/** Returns a <tr> element with the arguments applied. */
		tr(...primitives: Primitives[]): HTMLTableRowElement;

		/** Returns a <track> element with the arguments applied. */
		track(...primitives: Primitives[]): HTMLTrackElement;

		/** Returns a <u> element with the arguments applied. */
		u(...primitives: Primitives[]): HTMLElement;

		/** Returns a <ul> element with the arguments applied. */
		ul(...primitives: Primitives[]): HTMLUListElement;

		/** Returns a <var> element with the arguments applied. */
		var(...primitives: Primitives[]): HTMLElement;

		/** Returns a <video> element with the arguments applied. */
		video(...primitives: Primitives[]): HTMLVideoElement;

		/** Returns a <wbr> element with the arguments applied. */
		wbr(...primitives: Primitives[]): HTMLElement;
		
		//# <input> Elements
		
		/** Returns an <input type="button"> element with the arguments applied. */
		inputButton(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="checkbox"> element with the arguments applied. */
		inputCheckbox(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="color"> element with the arguments applied. */
		inputColor(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="date"> element with the arguments applied. */
		inputDate(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="datetime"> element with the arguments applied. */
		inputDatetime(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="datetime-local"> element with the arguments applied. */
		inputDatetimeLocal(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="email"> element with the arguments applied. */
		inputEmail(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="file"> element with the arguments applied. */
		inputFile(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="hidden"> element with the arguments applied. */
		inputHidden(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="image"> element with the arguments applied. */
		inputImage(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="month"> element with the arguments applied. */
		inputMonth(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="number"> element with the arguments applied. */
		inputNumber(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="password"> element with the arguments applied. */
		inputPassword(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="radio"> element with the arguments applied. */
		inputRadio(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="range"> element with the arguments applied. */
		inputRange(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="reset"> element with the arguments applied. */
		inputReset(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="search"> element with the arguments applied. */
		inputSearch(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="submit"> element with the arguments applied. */
		inputSubmit(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="tel"> element with the arguments applied. */
		inputTel(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="text"> element with the arguments applied. */
		inputText(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="time"> element with the arguments applied. */
		inputTime(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="url"> element with the arguments applied. */
		inputUrl(...primitives: Primitives[]): HTMLInputElement;
		
		/** Returns an <input type="week"> element with the arguments applied. */
		inputWeek(...primitives: Primitives[]): HTMLInputElement;
	}
}
