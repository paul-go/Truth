import * as X from "../X";


/**
 * 
 */
export class UriParser
{
	/**
	 * 
	 */
	static parse(raw: string): Partial<X.Uri> | null
	{
		let isRelative = false;
		let retractionCount = 0;
		let protocol = "";
		
		const parser = new X.Parser(raw);
		
		/**
		 * Reads ./
		 */
		function maybeReadCurrent()
		{
			const mark = parser.position;
			
			if (parser.read(X.UriSyntax.current))
				if (parser.read(X.UriSyntax.componentSeparator))
					return true;
			
			parser.position = mark;
			return false;
		}
		
		/**
		 * Reads ../../../
		 * @returns True if at least one retraction was read, otherwise false.
		 */
		function readRetractions()
		{
			const token = X.UriSyntax.retract + X.UriSyntax.componentSeparator;
			
			while (parser.more())
			{
				if (!parser.read(token))
					break;
				
				retractionCount++;
			}
			
			return retractionCount > 0;
		}
		
		/**
		 * Reads proto:
		 * Assigns the local protocol variable if necessary.
		 * @returns Trus if a protocol was found, otherwise false.
		 */
		function maybeReadProtocol()
		{
			const mark = parser.position;
			let rawProto = "";
			
			if (parser.read(X.UriSyntax.protocolRelative))
			{
				protocol = X.UriProtocol.unknown;
				return true;
			}
			
			const cancel = () =>
			{
				parser.position = mark;
				return false;
			};
			
			while (parser.more())
			{
				const char = parser.readGrapheme();
				
				if (isUpperAscii(char))
				{
					rawProto += String.fromCharCode(char.charCodeAt(0) + 32);
					continue;
				}
				
				if (isLowerAscii(char))
				{
					rawProto += char;
					continue;
				}	
				
				if (char === ":")
				{
					rawProto += ":";
					break;
				}
				
				return cancel();
			}
			
			// Protocols need to have the // suffix after them ... for now.
			if (!parser.read("//"))
				return cancel();
			
			return (protocol = rawProto) !== "";
		}
		
		/**
		 * Reads the store side or the type side of a URI.
		 */
		function readComponents(side: "store" | "type")
		{
			const mark = parser.position;
			const out: X.UriComponent[] = [];
			
			const cancel = () =>
			{
				parser.position = mark;
				return null;
			};
			
			while (parser.more())
			{
				const comp = readComponent();
				if (comp === null)
					break;
				
				// URIs cannot have type-side-only components on their store side
				if (side === "store")
					if (comp.index >= 0 || comp.isPattern)
						return cancel();
				
				out.push(comp);
				
				if (side === "store" && parser.read(X.UriSyntax.typeSeparator))
					break;
				
				if (parser.read(X.UriSyntax.componentSeparator))
					continue;
				
				break;
			}
			
			return out;
		}
		
		/**
		 * Reads a single URI component.
		 */
		function readComponent()
		{
			const mark = parser.position;
			const encChars = "._-~%".split("");
			const portChar = ":";
			let value = "";
			let port = "";
			let isParsingPort = false;
			
			const anonComp = maybeReadAnonymousComponent();
			if (anonComp)
				return anonComp;
			
			const quit = () =>
			{
				parser.position = mark;
				return null;
			};
			
			while (parser.more())
			{
				if (parser.peek(X.UriSyntax.componentSeparator))
					break;
				
				const g = parser.readGrapheme();
				
				if (g === portChar)
				{
					if (!isValidHostName(value) || !isValidIPv4Address(value))
						return quit();
					
					isParsingPort = true;
					continue;
				}
				
				if (isParsingPort)
				{
					if (!isDigit(g))
						return quit();
					
					port += g;
					
					if (port.length > 5)
						return quit();
				}
				else if (!encChars.includes(g) && !isUpperAscii(g) && !isLowerAscii(g) && !isDigit(g))
				{
					return quit();
				}
				else value += g;
			}
			
			if (value === "")
				return quit();
			
			return new X.UriComponent(port ? value + portChar + port : value);
		}
		
		/**
		 * 
		 */
		function maybeReadAnonymousComponent()
		{
			const mark = parser.position;
			
			const cancel = () =>
			{
				parser.position = mark;
				return null;
			};
			
			let anon = parser.read(X.UriSyntax.indexerStart);
			if (!anon)
				return null;
				
			while (parser.more())
			{
				if (parser.read(X.UriSyntax.indexerEnd))
					return anon.length > 0 ?
						new X.UriComponent(anon + X.UriSyntax.indexerEnd) :
						cancel();
				
				const g = parser.readGrapheme();
				if (!isDigit(g))
					break;
					
				anon += g;
			}
			
			return cancel();
		}
		
		if (maybeReadCurrent() || readRetractions())
		{
			isRelative = true;
		}
		else if (maybeReadProtocol())
		{
			// Do nothing
		}
		else if (parser.read(X.UriSyntax.componentSeparator))
		{
			protocol = X.UriProtocol.file;
		}
		else return null;
		
		const stores = readComponents("store");
		
		if (stores === null || stores.length === 0)
			return null;
		
		// URI ends with a /, this isn't a valid URI
		if (parser.readThenTerminal(X.UriSyntax.componentSeparator))
			return null;
		
		// URI ends with a //, this isn't a valid URI
		if (parser.readThenTerminal(X.UriSyntax.typeSeparator))
			return null;
		
		const types = readComponents("type");
		
		if (types === null)
			return null;
		
		if (types.length > 0)
		{
			// We should be done by now. 
			// If we're not, there's some garbage at the 
			// end of the URI, such as a forward slash.
			if (parser.more())
				return null;
		}
		
		const file = stores[stores.length - 1].value;
		const ext = (() =>
		{
			if (file.endsWith(X.UriExtension.truth))
				return X.UriExtension.truth;
			
			if (file.endsWith(X.UriExtension.js))
				return X.UriExtension.js;
			
			if (file.endsWith(X.UriExtension.wasm))
				return X.UriExtension.wasm;
			
			return X.UriExtension.unknown;
		})();
		
		// If an extension was detected, the last component
		// from the end of the URI should be removed, because
		// "stores" does not include file names.
		if (ext !== X.UriExtension.unknown)
			stores.pop();
		
		return {
			protocol: X.UriProtocol.resolve(protocol) || X.UriProtocol.unknown,
			file: ext ? file : "",
			ext,
			retractionCount,
			isRelative,
			stores: Object.freeze(stores),
			types: Object.freeze(types)
		};
	}
}

/** */
function isUpperAscii(char: string)
{
	const point = char.codePointAt(0) || 0;
	return point >= 65 && point <= 90;
}


/** */
function isLowerAscii(char: string)
{
	const point = char.codePointAt(0) || 0;
	return point >= 97 && point <= 122;
}


/** */
function isDigit(char: string)
{
	const point = char.codePointAt(0) || 0;
	return point >= 48 && point <= 57;
}

/** */
function isValidIPv4Address(maybeIP: string)
{
	if (!maybeIP)
		return false;
	
	const ipParts = maybeIP.split(".").filter(s => s);
	
	if (ipParts.length !== 4)
		return false;
	
	if (ipParts.some(s => !/^\d{1,3}$/.test(s)))
		return false;
	
	if (ipParts.some(s => parseInt(s, 10) > 255))
		return false;
	
	return true;
}

/** */
function isValidHostName(maybeHostName: string)
{
	if (!maybeHostName)
		return false;
	
	const hostParts = maybeHostName.split(".");
	if (hostParts.some(s => s.length === 0))
		return false;
	
	for (const hostPart of hostParts)
	{
		// NOTE: This is a make-shift host name validation
		// method. It should be replaced with something
		// that conforms to the relevant RFC specifications.
		const hostSegmentParts = hostPart.split(/-|--/);
		for (const hostSegmentPart of hostSegmentParts)
		{
			if (hostSegmentPart.length === 0)
				return false;
			
			for (const cp of [...hostSegmentPart].map(s => s.codePointAt(0)))
			{
				if (!cp || !(
					cp >= 48 && cp <= 57 ||
					cp >= 65 && cp <= 90 ||
					cp >= 97 && cp <= 122 ||
					cp >= 128 && cp <= 165 ||
					cp >= 255))
					return false;
			}
		}
	}
	
	return true;
}
