import * as X from "../CoreTests/X";
import * as Fs from "fs";


/**
 * This is a generic graph visualization tool that can be
 * used throughout the code to quickly generate graphs
 * for debugging purposes.
 */

const JsonViz = require("jsonviz");
const dirPath = "./Debug/GraphLogs/";
let nextFileNumber = 0;
const getFileNumber = (specificNumber?: number) =>
{
	const num = specificNumber === undefined ?
		++nextFileNumber :
		specificNumber;
	
	return ("0".repeat(6) + num).slice(-5) + ".svg";
}

/** */
function vizFn(root: any | null, fn: (value: any) => any)
{
	const jsonViz = new JsonViz();
	const objects = new Map<any, string>();
	
	const addNode = (object: any, name: string, kind: string) =>
	{
		const nodeName = Math.random().toString().slice(2);
		
		if (object instanceof Object)
			objects.set(object, nodeName);
		
		jsonViz.addNode(nodeName, {
			label: createTemplate(name, kind)
		});
		
		return nodeName;
	}
	
	if (root === null)
	{
		addNode(null, "null", "null");
	}
	else if (root === undefined)
	{
		addNode(undefined, "undefined", "undefined");
	}
	else
	{
		const recurse = (previous: any, current: any) =>
		{
			if (previous && objects.has(previous) && objects.has(current))
			{
				jsonViz.addEdge([objects.get(previous), objects.get(current)]);
				return;
			}
			
			const name = (() =>
			{
				if (current)
				{
					if (typeof current.name === "string" && current.name)
						return current.name;
					
					if (typeof current.toString === "function")
						return current.toString();
				}
				return null;
			})();
			
			if (name === null)
				return;
			
			const kind = (() =>
			{
				if (current === null)
					return "null";
				
				if (current === undefined)
					return "undefined";
				
				if (typeof current === "string")
					return `"${current}"`;
				
				if (current !== current)
					return "NaN";
				
				if (typeof current === "number"|| typeof current === "boolean")
					return current.toString();
				
				if (current.constructor && current.constructor.name)
					return current.constructor.name;
			})();
			
			const nodeName = addNode(current, name, kind);
			
			const vizResult = fn(current);
			if (vizResult === undefined || vizResult === null)
				return;
			
			if (vizResult instanceof Array || vizResult instanceof Set)
			{
				for (const item of vizResult)
					recurse(current, item);
			}
			else if (vizResult instanceof Map)
			{
				for (const item of vizResult.values())
					recurse(current, item);
			}
			else if (["string", "number", "boolean"].includes(typeof vizResult))
			{
				addNode(vizResult, name, kind);
			}
			
			if (objects.has(previous))
				jsonViz.addEdge([objects.get(previous)!, nodeName]);
		};
		
		if (root instanceof Array || root instanceof Set)
		{
			for (const item of root)
				recurse(null, item);
		}
		else if (root instanceof Map)
		{
			for (const item of root.values())
				recurse(null, item);
		}
		else recurse(null, root);
	}
		
	jsonViz.save(dirPath + getFileNumber());
	emitHtmlViewer();
}


/**
 * 
 */
function createTemplate(title: string, kind: string)
{
	kind = kind.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	
	if (title === kind)
		return title;
	
	return JsonViz.HTML(`
		${title}
		<br/>
		<font point-size="8" color="white">.</font>
		<br/>
		<font point-size="12" color="#888888">
			<i>${kind}</i>
		</font>
	`)
}


/**
 * 
 */
function emitHtmlViewer()
{
	const html = [`<!doctype html>
		<style>
			*
			{
				margin: 0;
				padding: 0;
				position: relative;
			}
			BODY
			{
				counter-reset: div 0;
			}
			DIV
			{
				padding-bottom: 20px;
				border-bottom: 1px solid #AAA;
				margin-bottom: 20px;
				counter-increment: div;
			}
			DIV:after
			{
				content: counter(div);
				position: absolute;
				top: 5px;
				left: 5px;
				font-family: sans-serif;
				font-size: 25px;
			}
			IMG
			{
				display: block;
				margin: auto;
			}
		</style>
	`];
	
	for (let i = 0; ++i <= nextFileNumber;)
		html.push(`<div><img src="${getFileNumber(i)}"></div>`);
	
	Fs.writeFileSync(dirPath + "view.html", html.join("\n"), "utf8");
}


export function init()
{
	for (const path of Fs.readdirSync(dirPath, "utf8"))
		Fs.unlinkSync(dirPath + path);
	
	(<any>global).viz = vizFn;
}
