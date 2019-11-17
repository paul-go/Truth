
/**
 * @internal
 * Restores the state of the application to it's state at
 * the time of emission. Called by the restoration script
 * that is generated during the rendering process.
 */
function restore(
	callbacks: readonly Reflex.RecurrentCallback<any>[],
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
	
	const C = Reflex.Core;
	const parse = C.Locator.parse;
	const error = () => new Error();
	
	if (commands.length % BlockSize.branch !== 0)
		throw error();
	
	for (let b = 0; b < commands.length; b += BlockSize.branch)
	{
		const id = "" + commands[b];
		const branch = document.getElementById(id);
		if (!branch)
			continue;
		
		const branchLocator = parse("" + commands[b + 1]);
		const branchMeta = new C.BranchMeta(branch, [], branchLocator);
		
		const textInfo: any[] = commands[b + 2];
		const streamInfo: any[] = commands[b + 3];
		
		if (textInfo.length % BlockSize.text !== 0 || 
			streamInfo.length % BlockSize.stream !== 0)
			throw error();
		
		// Assign locators to the appropriate Text nodes in the document.
		for (let textNodeIndex = 0, i = 0; i < textInfo.length; i += BlockSize.text)
		{
			const index: number = textInfo[i];
			const locator = parse(textInfo[i + 1]);
			
			for (let t = textNodeIndex - 1; ++t < branch.childNodes.length;)
			{
				const child = branch.childNodes[t];
				if (child instanceof Text)
				{
					if (textNodeIndex === index)
					{
						new C.LeafMeta(child, locator);
						break;
					}
					textNodeIndex++;
				}
			}
		}
		
		// Attach the recurrents to the branch (the HTML element).
		for (let s = 0; s < streamInfo.length; s += BlockSize.stream)
		{
			const streamLocator = parse(streamInfo[s]);
			const value = streamInfo[s + 1];
			const refLocator = (value === "prepend" || value === "append") ?
				value :
				parse(value);
			
			const selectors = ("" + streamInfo[s + 3]).split(Const.selectorSep);
			const callbackArgs = streamInfo[s + 5].slice();
			const recurrent = new Reflex.Recurrent(
				<Reflex.Core.RecurrentKind>streamInfo[s + 2],
				selectors,
				<Reflex.RecurrentCallback<unknown>>callbacks[streamInfo[s + 4]],
				callbackArgs);
			
			// An empty string selector indicates that the callback is a restore function.
			// Restore functions are handled like autorun functions.
			if (selectors.length === 1 && selectors[0] === "")
				recurrent.run(...callbackArgs);
			
			const rsm = new C.RecurrentStreamMeta(branchMeta, recurrent, streamLocator);
			const tracker = new C.Tracker(branch, refLocator);
			rsm.attach(branch, tracker);
		}
	}
}
