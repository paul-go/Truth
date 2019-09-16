
namespace Reflex.ML
{
	/**
	 * 
	 */
	export interface IRenderResult
	{
		readonly html: string;
		readonly js: string;
	}
	
	const enum BlockSize
	{
		branch = 4,
		text = 2,
		stream = 6,
	}
	
	const selectorSep = "…";
	let nextAnonId = 0;
	
	/**
	 * 
	 */
	export function render(
		target: Node | Node[],
		options?: {
			/**
			 * Whether or not the generated HTML and JavaScript
			 * should be formatted with whitespace characters.
			 * Default is true.
			 */
			format?: boolean;
			/**
			 * Whether or not the <!DOCTYPE html> directive
			 * should be emitted at the top of the generated HTML.
			 * Default is true.
			 */
			doctype?: boolean;
			/**
			 * Specifies the URL for the inline <script> tag that
			 * points to the restore script. If empty, the restore
			 * script is inlined within the generated HTML.
			 */
			restoreScriptURL?: string;
		}): Promise<IRenderResult>
	{
		nextAnonId = 0;
		
		const format = options ? options.format !== false : true;
		const doctype = options ? options.doctype !== false : true;
		const restoreScriptURL = options ? options.restoreScriptURL || "" : "";
		
		const t = format ? "\t" : "";
		const n = format ? "\n" : "";
		
		/**
		 * An intermediate class used to render an HTML document.
		 */
		class Tag
		{
			/**
			 * 
			 */
			constructor(e: HTMLElement)
			{
				const childMetas = Reflex.Core.Buffer.childrenOf(e);
				
				this.hasRecurrents = childMetas.some(m =>
					m instanceof Core.RecurrentStreamMeta);
				
				this.name = e.tagName.toLowerCase();
				this.metas = childMetas;
				
				const branchMeta = Core.BranchMeta.of(e);
				if (branchMeta)
					this.locatorText = branchMeta.locator.toString();
				
				this.id = e.getAttribute("id") || "";
				if (!this.id && this.hasRecurrents)
				{
					this.id = (++nextAnonId).toString();
					this.attributes.id = this.id;
				}
				
				for (let i = -1; ++i < e.attributes.length;)
				{
					const attr = e.attributes[i];
					this.attributes[attr.name] = attr.value;
				}
			}
			
			/**
			 * Converts this Tag, and all it's nested children into
			 * an HTML string representation.
			 */
			toString(indentLevel = 0)
			{
				const attributes = Object.entries(this.attributes)
					.map(([k, v]) => ` ${k}="${v}"`)
					.join("");
				
				const lines: string[] = [];
				const indent = t.repeat(indentLevel);
				const line = [indent, "<", this.name, attributes, ">"];
				
				const closer = hasClose(this.name) ? `</${this.name}>` : "";
				if (closer)
				{
					const chLen = this.children.length;
					const chFirst = chLen > 0 ? this.children[0] : null;
					
					if (chLen === 0)
					{
						line.push(closer);
					}
					// This is a formatting optimization. If the element only contains a
					// single Text object, and said Text object only contains a small 
					// amount of text, it's rendered on a single line.
					else if (typeof chFirst === "string" && indentLevel * 4 + chFirst.length <= 50)
					{
						line.push(chFirst, closer);
					}
					else
					{
						const indentNest = indent + t;
						
						for (let i = -1; ++i < this.children.length;)
						{
							const child = this.children[i];
							const prevChild = i > 0 ? this.children[i - 1] : null;
							
							if (typeof child === "string")
							{
								if (typeof prevChild === "string" && this.hasRecurrents)
									lines.push(indentNest + "<!---->");
								
								lines.push(indentNest + child);
							}
							else
							{
								lines.push(child.toString(indentLevel + 1));
							}
						}
						
						lines.push(indent + closer);
					}
				}
				
				lines.unshift(line.join(""));
				return lines.join(n);
			}
			
			/** */
			readonly id: string = "";
			
			/** */
			readonly children: (Tag | string)[] = [];
			
			/** */
			readonly locatorText: string = "";
			
			/** */
			readonly metas: readonly Core.Meta[];
			
			private readonly name: string;
			private readonly attributes: { [key: string]: string } = {};
			private readonly hasRecurrents: boolean;
		}
		
		/** */
		function execute()
		{
			const rootTags: Tag[] = [];
			const rootNodes = Array.isArray(target) ? target : [target];
			
			for (const rootNode of rootNodes)
				if (rootNode instanceof HTMLElement)
					rootTags.push(createTagsRecursive(rootNode));
			
			const js = generateRestoreScript(rootTags);
			const html = rootTags.map(t => t.toString());
			if (doctype)
				html.unshift("<!DOCTYPE html>");
			
			if (js)
				restoreScriptURL ?
					html.push(`<script src="${restoreScriptURL}"></script>`) :
					html.push("<script>", js, "</script>");
			
			return { html: html.join(n), js };
		}
		
		/** */
		function generateRestoreScript(tags: Tag[])
		{
			const callbacks: Function[] = [];
			const commands: any[] = [];
			
			function recurseTags(tag: Tag)
			{
				if (tag.id)
				{
					commands.push(tag.id);
					commands.push(tag.locatorText);
					
					const textCommands = tag.metas
						.filter((m): m is Core.ContentMeta => m instanceof Core.ContentMeta)
						.map((meta, index) => [index, meta.locator.toString()]);
					
					commands.push(textCommands);
					
					const streamCommands: any[] = [];
					commands.push(streamCommands);
					
					const rsms = tag.metas
						.filter((m): m is Core.RecurrentStreamMeta =>
							m instanceof Core.RecurrentStreamMeta);
					
					for (const rsm of rsms)
					{
						const rec = rsm.recurrent;
						
						streamCommands.push(getTrackerValue(tag, rsm));
						streamCommands.push(rsm.locator.toString());
						streamCommands.push(rec.kind);
						
						// Append the selector
						const selectorParts = Array.isArray(rec.selector) ?
							rec.selector :
							[rec.selector];
						
						const selectorSerialized = selectorParts
							.filter((s): s is string => typeof s === "string")
							.join(selectorSep);
						
						streamCommands.push(selectorSerialized);
						
						// Append the callback index
						let cbIdx = callbacks.indexOf(rec.userCallback);
						if (cbIdx < 0)
							cbIdx = callbacks.push(rec.userCallback) - 1;
						
						streamCommands.push(cbIdx);
						
						// Append the callback arguments
						if (!isSerializable(rec.userRestArgs))
							throw new Error("Invalid argument passed to closure, which cannot be serialized.");
						
						streamCommands.push(rec.userRestArgs);
					}
				}
				
				for (const childTag of tag.children)
					if (childTag instanceof Tag)
						recurseTags(childTag);
			}
			
			for (const tag of tags)
				recurseTags(tag);
			
			if (commands.length === 0)
				return "";
			
			const lines: string[] = ["Reflex.ML.restore(["];
			
			for (let i = -1; ++i < callbacks.length;)
				lines.push(callbacks[i].toString() + (i < callbacks.length - 1 ? "," : ""));
			
			lines.push("],[");
			
			for (let i = -1; ++i < commands.length;)
				lines.push(JSON.stringify(commands[i]) + (i < commands.length - 1 ? "," : ""));
			
			lines.push("]);");
			return lines.join(n);
		}
		
		/**
		 * Returns the value to pass to the "ref" parameter of the
		 * Tracker constructor, in order to construct the specified
		 * Meta object.
		 */
		function getTrackerValue(tag: Tag, meta: Core.Meta)
		{
			const metaIdx = tag.metas.indexOf(meta);
			
			if (metaIdx === 0)
				return "prepend";
			
			if (metaIdx === tag.metas.length - 1)
				return "append";
			
			return tag.metas[metaIdx - 1].locator.toString();
		}
		
		/** */
		function isSerializable(value: any)
		{
			try
			{
				JSON.stringify(value);
				return true;
			}
			catch (e)
			{
				return false;
			}
		}
		
		/** */
		function createTagsRecursive(e: HTMLElement)
		{
			const tag = new Tag(e);
			
			for (let i = -1; ++i < e.childNodes.length;)
			{
				const child = e.childNodes[i];
				
				if (child instanceof HTMLElement)
					tag.children.push(createTagsRecursive(child));
				
				else if (child instanceof Text)
					tag.children.push(child.textContent || "");
			}
			
			return tag;
		}
		
		return new Promise(resolve =>
		{
			Reflex.Core.ReadyState.await(() =>
			{
				resolve(execute());
			});
		});
	}
	
	/** */
	function hasClose(tagName: string)
	{
		return ![
			"area",
			"base",
			"br",
			"col",
			"embed",
			"hr",
			"img",
			"input",
			"link",
			"meta",
			"param",
			"source",
			"track",
			"wbr"
		].includes(tagName);
	}
	
	/**
	 * Restores the state of the application to it's state at
	 * the time of rendering. Called by the restoration script
	 * that is generated during the rendering process.
	 */
	export function restore(
		callbacks: readonly Core.RecurrentCallback<any>[],
		commands: readonly any[])
	{
		/*
		The commands array is a long series of entries. The entries are consumed
		sequentially, like a parser. Below is a schematic of how this array is organized:
		
		[
			ID: number | string,
			BRANCH LOCATOR: string,
			[
				TEXT INDEX: number,
				TEXT LOCATOR: string,
				(Pattern Repeats)
			],
			[
				STREAM TRACKER: string
				STREAM LOCATOR: string
				KIND: number,
				SELECTOR: string,
				CALLBACK INDEX: number
				CALLBACK ARGS: any[]
				(Pattern Repeats)
			],
			(Pattern Repeats)
		]
		*/
		
		const error = () => new Error("Invalid commands array.");
		
		if (commands.length % BlockSize.branch !== 0)
			throw error();
		
		for (let b = 0; b < commands.length; b += BlockSize.branch)
		{
			const id = "" + commands[b];
			const branch = document.getElementById(id);
			if (!branch)
				continue;
			
			const branchLocator = Reflex.Core.Locator.parse("" + commands[b + 1]);
			const branchMeta = new Core.BranchMeta(branch, [], branchLocator);
			
			const textInfo: any[] = commands[b + 2];
			const streamInfo: any[] = commands[b + 3];
			
			if (textInfo.length % BlockSize.text !== 0)
				throw error();
			
			if (streamInfo.length % BlockSize.stream !== 0)
				throw error();
			
			// Assign locators to the appropriate Text nodes in the document.
			for (let textNodeIndex = 0, i = 0; i < textInfo.length; i += BlockSize.text)
			{
				const index: number = textInfo[i];
				const locator = Core.Locator.parse(textInfo[i + 1]);
				
				for (let t = textNodeIndex - 1; ++t < branch.childNodes.length;)
				{
					const child = branch.childNodes[t];
					if (child instanceof Text)
					{
						if (textNodeIndex === index)
						{
							new Core.ContentMeta(child, locator);
							break;
						}
						textNodeIndex++;
					}
				}
			}
			
			// Attach the recurrents to the branch (the HTML element).
			for (let s = 0; s < streamInfo.length; s += BlockSize.stream)
			{
				const streamLocator = Core.Locator.parse(streamInfo[s]);
				const refLocator = (() =>
				{
					const value = streamInfo[s + 1];
					if (value === "prepend" || value === "append")
						return value;
					
					return Core.Locator.parse(value);
				})();
				
				const kind: Core.RecurrentKind = streamInfo[s + 2];
				const selectors = ("" + streamInfo[s + 3]).split(selectorSep);
				const callback = callbacks[streamInfo[s + 4]];
				const callbackArgs = streamInfo[s + 5].slice();
				const recurrent = new Core.Recurrent(kind, selectors, callback, callbackArgs);
				
				// An empty string selector indicates that the callback is a restore function.
				// Restore functions are handled like autorun functions.
				if (selectors.length === 1 && selectors[0] === "")
					recurrent.run(...callbackArgs);
				
				const rsm = new Core.RecurrentStreamMeta(branchMeta, recurrent, streamLocator);
				const tracker = new Core.Tracker(branch, refLocator);
				rsm.attach(branch, tracker);
			}
		}
	}
}
