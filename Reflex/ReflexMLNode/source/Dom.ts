
//
// This file contains a bunch of classes that amount to a miniature 
// implementation of the HTML DOM. The goal of these classes is
// not to aim for feature parity with the actual W3C DOM, but rather
// to simply provide a lightweight way of generating HTML elements, 
// potentially with events bound to them. For a more full featured
// implementation of the DOM, the jsdom project is probably more
// suitable.
//

namespace Dom
{
	/**
	 * 
	 */
	export class Window
	{
		
	}
	
	/**
	 * 
	 */
	export class Document
	{
		constructor()
		{
			this.documentElement.childNodes.push(this.head);
			this.documentElement.childNodes.push(this.body);
		}
		
		readonly documentElement = new HTMLElement("html");
		readonly head = new HTMLElement("head");
		readonly body = new HTMLElement("body");
		
		/** */
		createElement(tagName: string)
		{
			switch (tagName)
			{
				case "link": return new HTMLLinkElement();
				case "input": return new HTMLInputElement();
			}
			
			return new HTMLElement(tagName);
		}
		
		/** */
		createTextNode(wholeText: string)
		{
			return new Text(wholeText);
		}
		
		/** */
		createComment(data: string)
		{
			return new Comment(data);
		}
	}
	
	/**
	 * 
	 */
	export class Node
	{
		parentElement: HTMLElement | null = null;
	}
	
	/**
	 * 
	 */
	export class Comment extends Node
	{
		constructor(public data: string) { super(); }
	}
	
	/**
	 * Shim class for compatibility reasons. Do not use.
	 */
	export class Element extends Node { }
	
	/**
	 * 
	 */
	export class HTMLElement extends Element
	{
		/** */
		constructor(readonly tagName: string)
		{
			super();
			const children: any = this.children;
			children.item = (idx: number) => this.children[idx] || null;
		}
		
		/** */
		protected setParents(elements: (HTMLElement | Text)[])
		{
			for (const e of elements)
				e.parentElement = this;
		}
		
		readonly attributes = new NamedNodeMap();
		
		/** */
		getAttribute(attributeName: string)
		{
			const ni = this.attributes.getNamedItem(attributeName);
			return ni ? ni.value : "";
		}
		
		/** */
		setAttribute(attributeName: string, attributeValue: string)
		{
			const attr = new Attr(attributeName, attributeValue);
			this.attributes.setNamedItem(attr);
		}
		
		/** */
		hasAttribute(attributeName: string)
		{
			for (let i = -1; ++i < this.attributes.length;)
				if (this.attributes.item(i).name === attributeName)
					return true;
			
			return false;
		}
		
		/** */
		readonly classList = new DOMTokenList();
		
		/** */
		textContent: string = "";
		
		/** */
		readonly childNodes: Node[] = [];
		
		/** */
		get children(): readonly Element[]
		{
			return Object.freeze(this.childNodes.filter(c => c instanceof Element));
		}
		
		/** */
		get previousElementSibling() { return null; }
		
		/** */
		get nextElementSibling() { return null; }
		
		/** */
		get childElementCount() { return this.childNodes.filter(e => e instanceof HTMLElement).length; }
		
		/** */
		get firstElementChild() { return this.childNodes.find(e => e instanceof HTMLElement) || null; }
		
		/** */
		get lastElementChild() { return this.childNodes.find(e => e instanceof HTMLElement) || null; }
		
		/** */
		appendChild(e: HTMLElement)
		{
			e.parentElement = this;
			this.childNodes.push(e);
		}
		
		/** */
		append(...nodes: (HTMLElement | Text)[])
		{
			this.setParents(nodes);
			this.childNodes.push(...nodes);
		}
		
		/** */
		preprend(...nodes: (HTMLElement | Text)[])
		{
			this.setParents(nodes);
			this.childNodes.unshift(...nodes);
		}
		
		/** */
		insertBefore(e: HTMLElement, ref: HTMLElement)
		{
			e.parentElement = this;
			
			for (let i = -1; ++i < this.childNodes.length;)
			{
				if (this.childNodes[i] === ref)
				{
					this.childNodes.splice(i, 0, e);
					return e;
				}
			}
			
			this.childNodes.push(e);
			return e;
		}
		
		/** */
		insertAdjacentElement(position: string, element: HTMLElement)
		{
			if (position === "afterbegin")
			{
				this.childNodes.unshift(element);
				element.parentElement = this;
				return element;
			}
			
			if (position === "beforeend")
			{
				this.childNodes.push(element);
				element.parentElement = this;
				return element;
			}
			
			const parent = this.parentElement;
			if (!parent)
				return null;
			
			const cn = parent.childNodes;
			const thisPos = cn.indexOf(this);
			if (thisPos < 0)
				return null;
				
			element.parentElement = parent;
			
			if (position === "beforebegin")
			{
				cn.splice(thisPos, 0, element);
				return element;
			}
			
			if (position === "afterend")
			{
				cn.splice(thisPos + 1, 0, element);
				return element;
			}
			
			return null;
		}
		
		/** */
		insertAdjacentHTML(position: string, htmlText: string)
		{
			switch (position)
			{
				case "beforeend": return this.append(new Text(htmlText));
			}
			
			throw new Error("Not implemented");
		}
		
		// Implementations for adding and removing event listeners
		// isn't necessary to support server-side reflex because the
		// actual event listeners are never triggered, but the information
		// required to reconstruct the event attachments is still stored in
		// the Core.
		
		/** */
		addEventListener(type: string, callback: Function) { }
		
		/** */
		removeEventListener(type: string, callback: Function) { }
		
		/** */
		contains(e: HTMLElement)
		{
			const queue = this.childNodes.slice();
			
			for (let i = -1; ++i < queue.length;)
			{
				const item = queue[i];
				if (item === e)
					return true;
				
				if (item instanceof HTMLElement)
					queue.push(...item.childNodes);
			}
			
			return false;
		}
		
		/** */
		get innerHTML()
		{
			return "";
		}
		
		/** */
		get outerHTML()
		{
			return "";
		}
		
		/** */
		toString()
		{
			return "";
		}
	}

	/** */
	export class HTMLLinkElement extends HTMLElement
	{
		constructor() { super("link"); }
		
		get rel() { return this.getAttribute("rel"); }
		set rel(value: string | null) { this.setAttribute("rel", value || ""); }
		
		get type() { return this.getAttribute("type"); }
		set type(value: string | null) { this.setAttribute("type", value || ""); }
		
		get href() { return this.getAttribute("href"); }
		set href(value: string | null) { this.setAttribute("href", value || ""); }
	}

	/** */
	export class HTMLStyleElement extends HTMLElement
	{
		constructor() { super("style"); }
		
		get type() { return this.getAttribute("type"); }
		set type(value: string | null) { this.setAttribute("type", value || ""); }
	}

	/** */
	export class HTMLInputElement extends HTMLElement
	{
		constructor() { super("input"); }
	}

	/** */
	export class Text extends Node
	{
		constructor(readonly textContent: string) { super(); }
	}

	export class HTMLHtmlElement extends HTMLElement { }
	export class HTMLTitleElement extends HTMLElement { }
	export class HTMLScriptElement extends HTMLElement { }
	export class HTMLAnchorElement extends HTMLElement { }
	export class HTMLAreaElement extends HTMLElement { }
	export class HTMLAudioElement extends HTMLElement { }
	export class HTMLBaseElement extends HTMLElement { }
	export class HTMLBaseFontElement extends HTMLElement { }
	export class HTMLQuoteElement extends HTMLElement { }
	export class HTMLBRElement extends HTMLElement { }
	export class HTMLButtonElement extends HTMLElement { }
	export class HTMLCanvasElement extends HTMLElement { }
	export class HTMLTableCaptionElement extends HTMLElement { }
	export class HTMLTableColElement extends HTMLElement { }
	export class HTMLDataElement extends HTMLElement { }
	export class HTMLDataListElement extends HTMLElement { }
	export class HTMLModElement extends HTMLElement { }
	export class HTMLDetailsElement extends HTMLElement { }
	export class HTMLDirectoryElement extends HTMLElement { }
	export class HTMLDivElement extends HTMLElement { }
	export class HTMLDListElement extends HTMLElement { }
	export class HTMLEmbedElement extends HTMLElement { }
	export class HTMLFieldSetElement extends HTMLElement { }
	export class HTMLFormElement extends HTMLElement { }
	export class HTMLFrameElement extends HTMLElement { }
	export class HTMLFrameSetElement extends HTMLElement { }
	export class HTMLHeadingElement extends HTMLElement { }
	export class HTMLHRElement extends HTMLElement { }
	export class HTMLIFrameElement extends HTMLElement { }
	export class HTMLImageElement extends HTMLElement { }
	export class HTMLLabelElement extends HTMLElement { }
	export class HTMLLegendElement extends HTMLElement { }
	export class HTMLLIElement extends HTMLElement { }
	export class HTMLMapElement extends HTMLElement { }
	export class HTMLMarqueeElement extends HTMLElement { }
	export class HTMLMenuElement extends HTMLElement { }
	export class HTMLMeterElement extends HTMLElement { }
	export class HTMLObjectElement extends HTMLElement { }
	export class HTMLOListElement extends HTMLElement { }
	export class HTMLOptGroupElement extends HTMLElement { }
	export class HTMLOptionElement extends HTMLElement { }
	export class HTMLOutputElement extends HTMLElement { }
	export class HTMLParagraphElement extends HTMLElement { }
	export class HTMLParamElement extends HTMLElement { }
	export class HTMLPictureElement extends HTMLElement { }
	export class HTMLPreElement extends HTMLElement { }
	export class HTMLProgressElement extends HTMLElement { }
	export class HTMLSelectElement extends HTMLElement { }
	export class HTMLSlotElement extends HTMLElement { }
	export class HTMLSourceElement extends HTMLElement { }
	export class HTMLSpanElement extends HTMLElement { }
	export class HTMLTableElement extends HTMLElement { }
	export class HTMLTableSectionElement extends HTMLElement { }
	export class HTMLTableDataCellElement extends HTMLElement { }
	export class HTMLTemplateElement extends HTMLElement { }
	export class HTMLTextAreaElement extends HTMLElement { }
	export class HTMLTableHeaderCellElement extends HTMLElement { }
	export class HTMLTimeElement extends HTMLElement { }
	export class HTMLTableRowElement extends HTMLElement { }
	export class HTMLTrackElement extends HTMLElement { }
	export class HTMLUListElement extends HTMLElement { }
	export class HTMLVideoElement extends HTMLElement { }
	
	/** */
	export class NamedNodeMap
	{
		*[Symbol.iterator]()
		{
			for (let i = -1; ++i < this.attrs.length;)
				yield this.attrs[i];
		}
		
		/** */
		get length()
		{
			return this.attrs.length;
		}
		
		/** */
		getNamedItem(name: string)
		{
			for (let i = -1; ++i < this.attrs.length;)
				if (this.attrs[i].name === name)
					return this.attrs[i];
			
			return null;
		}
		
		/** */
		setNamedItem(attr: Attr)
		{
			for (let i = this.attrs.length - 1; i-- > 0;)
			{
				if (attr.name === this.attrs[i].name)
				{
					this.attrs[i] = attr;
					return attr;
				}
			}
			
			this.attrs.push(attr);
			return attr;
		}
		
		/** */
		removeNamedItem(attr: Attr)
		{
			for (let i = this.attrs.length - 1; i-- > 0;)
				if (attr.name === this.attrs[i].name)
					return this.attrs.splice(i, 0)[0] || null;
			
			return null;
		}
		
		/** */
		item(index: number)
		{
			return this.attrs[index];
		}
		
		private readonly attrs: Attr[] = [];
	}
	
	/** */
	export class Attr
	{
		constructor(
			readonly name: string,
			public value: string)
		{ }
	}
	
	/** */
	export class DOMTokenList
	{
		/** */
		add(...tokens: string[])
		{
			this.tokens.push(...tokens);
			this.tokens = this.tokens.filter((v, i, a) => a.indexOf(v) === i);
		}
		
		/** */
		contains(token: string)
		{
			return this.tokens.includes(token);
		}
		
		/** */
		item(index: number)
		{
			return index >= 0 && index < this.tokens.length ?
				this.tokens[index] :
				null;
		}
		
		/** */
		get length()
		{
			return this.tokens.length;
		}
		
		/** */
		remove(...tokens: string[])
		{
			for (let i = this.tokens.length; --i > 0;)
				if (tokens.includes(this.tokens[i]))
					this.tokens.splice(i, 1);
		}
		
		/** */
		get value()
		{
			return this.tokens.join(" ");
		}
		
		/** */
		private tokens: string[] = [];
	}
	
	export const window = new Window();
	export const document = new Document();
}

/**
 * Installs the mini dom on the specified target object (which
 * is typically the environment's global object).
 */
function installMiniDom(target: any)
{
	if (target)
		for (const name of Object.getOwnPropertyNames(Dom))
			target[name] = Reflect.get(Dom, name);
}

installMiniDom(global);
