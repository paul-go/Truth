/// <reference path="index.d.ts" />

/**
 * @internal
 * Accessed externally via `ml.emit(...)`.
 * This code is attaching the emit() function to the global `ml` object.
 */
export function emit(target: Node | Node[], options?: Reflex.ML.IEmitOptions)
{
	const format = options ? options.format !== false : true;
	const doctype = options ? options.doctype !== false : true;
	const restoreScriptURI = options && options.restoreScriptURI || "";
	const restoreScriptOutPath = options && options.restoreScriptOutPath || "";
	const htmlOutPath = options && options.htmlOutPath || "";
	const t = format ? "\t" : "";
	const n = format ? "\n" : "";
	let nextAnonId = 0;
	
	/**
	 * An intermediate class used to emit an HTML document.
	 */
	class Tag
	{
		/**
		 * 
		 */
		constructor(e: HTMLElement)
		{
			const childMetas = Reflex.Core.childrenOf(e);
			
			this.hasRecurrents = childMetas.some(m =>
				m instanceof Reflex.Core.RecurrentStreamMeta);
			
			this.name = e.tagName.toLowerCase();
			this.metas = childMetas;
			
			const branchMeta = Reflex.Core.BranchMeta.of(e);
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
				const attr = e.attributes.item(i)!;
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
				// amount of text, it's emitted on a single line.
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
		readonly metas: readonly Reflex.Core.Meta[];
		
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
			restoreScriptURI ?
				html.push(`<script src="${restoreScriptURI}"></script>`) :
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
					.filter((m): m is Reflex.Core.ContentMeta => m instanceof Reflex.Core.ContentMeta)
					.map((meta, index) => [index, meta.locator.toString()])
					.reduce((a, b) => a.concat(b));
				
				commands.push(textCommands);
				
				const streamCommands: any[] = [];
				commands.push(streamCommands);
				
				const rsms = tag.metas
					.filter((m): m is Reflex.Core.RecurrentStreamMeta =>
						m instanceof Reflex.Core.RecurrentStreamMeta);
				
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
						.join(Const.selectorSep);
					
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
		
		const restoreFnText = (<typeof import("fs")>require("fs"))
			.readFileSync(__dirname + "/Restore.min.js")
			.toString()
			.replace(/^function restore/, "function");
		
		const lines: string[] = [`(${restoreFnText})([`];
		
		for (let i = -1; ++i < callbacks.length;)
			lines.push(callbacks[i].toString() + (i < callbacks.length - 1 ? "," : ""));
		
		lines.push("],[");
		
		for (let i = -1; ++i < commands.length;)
			lines.push(JSON.stringify(commands[i]) + (i < commands.length - 1 ? "," : ""));
		
		lines.push("]);");
		return lines.join("");
	}
	
	/**
	 * Returns the value to pass to the "ref" parameter of the
	 * Tracker constructor, in order to construct the specified
	 * Meta object.
	 */
	function getTrackerValue(tag: Tag, meta: Reflex.Core.Meta)
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
		Reflex.Core.ReadyState.await(async () =>
		{
			const result = execute();
			
			if (htmlOutPath)
			{
				const htmlOutPathWithFile = normalizeHtmlOutPath(htmlOutPath);
				const htmlOutPathFinal = resolvePath(htmlOutPathWithFile);
				await writeFile(htmlOutPathFinal, result.html);
			}
			
			if (restoreScriptURI && result.js)
			{
				const scriptDir = 
					extractPath(restoreScriptOutPath) ||
					extractPath(htmlOutPath);
				
				const scriptFileName = 
					extractFileName(restoreScriptURI) || 
					extractFileName(restoreScriptOutPath) ||
					"restore.js";
				
				const scriptOutPathFinal = resolvePath(
					scriptDir,
					scriptFileName);
				
				await writeFile(scriptOutPathFinal, result.js);
			}
			
			resolve(result);
		});
	});
}

/** @internal */
function extractFileName(uri: string)
{
	const uriNoQuery = uri.split("?", 1)[0];
	const parts = uriNoQuery.split(/[\\\/]/g);
	const last = parts[parts.length - 1];
	return last.indexOf(".") > -1 ? last : "";
}

/** @internal */
function extractPath(pathMaybeWithFile: string)
{
	if (!pathMaybeWithFile)
		return "";
	
	let out = pathMaybeWithFile;
	
	const fileName = extractFileName(pathMaybeWithFile);
	if (fileName)
		out = out.slice(0, -fileName.length);
	
	return out;
}

/** @internal */
function resolvePath(...paths: string[])
{
	if (typeof require === "function")
	{
		const path = <typeof import("path")>require("path");
		return path.join(process.cwd(), ...paths);
	}
	
	throw new Error("Not implemented.");
}

/** @internal */
function normalizeHtmlOutPath(outPath: string)
{
	let out = outPath.trim();
	const slashPos = Math.max(out.lastIndexOf("/"), out.lastIndexOf("\\"));
	
	if (slashPos === out.length - 1)
	{
		out += "index.html";
	}
	else if (slashPos < 0)
	{
		if (out.indexOf(".") < 0)
			out += "/index.html";
	}
	else
	{
		const last = out.slice(slashPos + 1);
		if (last.indexOf(".") < 0)
			out += "/index.html";
	}
	
	return out;
}

/** */
async function writeFile(fullPath: string, content: string): Promise<void>
{
	return new Promise(resolve =>
	{ 
		if (typeof require === "function")
		{
			const fs = <typeof import("fs")>require("fs");
			fs.writeFile(fullPath, content, error =>
			{
				if (error)
					throw error;
				
				resolve();
			});
		}
	});
}

/** @internal */
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
