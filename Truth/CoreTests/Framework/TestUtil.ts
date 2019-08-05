import * as X from "../X";
import * as Process from "child_process";


/**
 * Removes the indentation common to every line in the specified, 
 * so that Truth source code can be processed as if
 * there isn't a universal indent applied to every line.
 */
export function outdent(literals: TemplateStringsArray, ...placeholders: string[])
{
	let result = "";
	
	for (let i = -1; ++i < placeholders.length;)
		result += literals[i] + placeholders[i];
	
	result += literals[literals.length - 1];
	const lines = result.split("\n");
	
	// Remove all leading whitespace-only lines.
	while (lines.length && lines[0].trim() === "")
		lines.shift();
	
	// Cut off whitespace-only trailing lines
	while (lines[lines.length - 1].trim() === "")
		lines.pop();
	
	// Find the first non whitespace line with the least amount 
	// of indent, and use it as the universal indent trimmer.
	let minIndent = Number.MAX_SAFE_INTEGER;
	
	for (let i = -1; ++i < lines.length;)
	{
		const line = lines[i];
		if (line.trim() === "")
			continue;
		
		const size = line.length - line.replace(/^\s*/, "").length;
		if (size < minIndent)
			minIndent = size;
	}
	
	// Slice off the left side of the string.
	if (minIndent > 0 && minIndent !== Number.MAX_SAFE_INTEGER)
		for (let i = -1; ++i < lines.length;)
			lines[i] = lines[i].slice(minIndent);
	
	return lines.join("\n");
}


/**
 * A class that contains utility methods for creating fake URIs.
 */
export abstract class FakeUri
{
	/** */
	static http = Object.freeze({
		truth: () => `//www.domain.com/${FakeUri.createRandomName()}.truth`,
		agent: () => `//www.domain.com/${FakeUri.createRandomName()}.js`
	});
	
	/** */
	static file = Object.freeze({
		truth: () => `file://Users/JohnDoe/${FakeUri.createRandomName()}.truth`,
		agent: () => `file://Users/JohnDoe/${FakeUri.createRandomName()}.js`
	});
	
	/** Generates a random file name. */
	private static createRandomName()
	{
		const chars: string[] = [];
		
		for (let i = -1; ++i < 8;)
		{
			const num = Math.floor(Math.random() * 26) + 65;
			const letter = String.fromCharCode(num);
			chars.push(letter);
		}
		
		return chars.join("");
	}
}


/**
 * 
 */
export abstract class File
{
	/** */
	private static maybeLaunchCleanupProcess()
	{
		if (this.hasLaunchedCleanupProcess)
			return;
		
		const command = "node";
		const args: string[] = [];
		
		const proc = Process.spawn(command, args, {
			cwd: "",
			detached: true
		});
	}
	
	/** */
	private static hasLaunchedCleanupProcess = false;
}

