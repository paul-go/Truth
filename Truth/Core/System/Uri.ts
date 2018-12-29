import * as X from "../X";
import * as Path from "path";


/**
 * An enumeration that lists all availble protocols
 * supported by the system. The list can be enumerated
 * via Uri.eachProtocol()
 */
export enum UriProtocol
{
	none = "",
	unknown = "?",
	file = "file:",
	https = "https:",
	http = "http:",
	internal = "system-internal:"
}


/** 
 * A class that represents a Truth URI.
 * A Truth URI can point to a truth file, or an agent through a variety of 
 * different protocols, just like a normal URI. However, a Truth URI that
 * points to a Truth file can also point to declarations within that file
 * directly in the URI, using the double slash syntax. For example:
 * 
 * //domain.com/File.truth//Path/To/Declaration
 */
export class Uri
{
	/**
	 * Enumerates through the list of available
	 * protocols supported by the system.
	 */
	static *eachProtocol(): IterableIterator<UriProtocol>
	{
		for (const protocol of Object.values(UriProtocol))
			if (protocol !== UriProtocol.none)
				yield protocol;
	}
	
	/**
	 * @param uriText A string containing the URI to parse
	 * @param relativeFallback A URI that identifies the origin
	 * of the URI being parsed, used in the case when the
	 * uriText parameter is a relative path.
	 */
	static parse(uriText: string, relativeFallback?: Uri): Uri | null
	{
		let protocol = (() =>
		{
			for (const protocol of this.eachProtocol())
				if (uriText.startsWith(protocol))
					return protocol;
			
			if (/^([A-Za-z]+-?)+:/.test(uriText))
				return UriProtocol.unknown;
			
			return UriProtocol.none;
		})();
		
		if (protocol === UriProtocol.unknown)
			return null;
		
		const [filePathFull, typePathFull] = uriText
			.replace(/^([a-z][a-z0-9-.+]*:)?\/\//, "")
			.split(X.Syntax.typePathSeparator, 2);
		
		const filePathParts = filePathFull
			.split("/")
			.map(s => decodeURIComponent(s));
		
		let fileName = "";
		let ioPath = filePathParts.slice();
		
		const typePath = (() =>
		{
			if (!typePathFull)
				return [];
			
			let out = typePathFull.split("/");
			
			if (out.some(p => p === "" || p.trim() !== p))
				throw X.Exception.invalidTypePath();
			
			return out.map(p => decodeURIComponent(p));
		})();
		
		if (filePathParts.length)
		{
			const lastFilePathPart = filePathParts[filePathParts.length - 1];
			const dotPos = lastFilePathPart.lastIndexOf(".");
			
			if (dotPos >= 0)
				fileName = lastFilePathPart;
		}
		
		// If there is no protocol, then we need
		// to look to the relativeFallback argument to
		// create the fully qualified path.
		if (protocol === UriProtocol.none)
		{
			if (relativeFallback)
			{
				const prot = relativeFallback.protocol;
				
				if (prot === UriProtocol.file)
					ioPath = Path.resolve(Path.join(...relativeFallback.ioPath), uriText)
						.split(Path.sep);
				
				else if (prot === UriProtocol.https || prot === UriProtocol.http)
					ioPath = [];
				
				else throw X.Exception.notImplemented();
				
				protocol = prot;
			}
			else
			{
				// If there is no detected type, and the relativeFallback
				// argument wasn't specified, we assume that the
				// URI refers to a local file, relative to the current
				// working directory.
				protocol = UriProtocol.file;
				ioPath = Path.resolve(uriText).split(Path.sep);
			}
		}
		
		return new Uri(
			protocol,
			fileName,
			ioPath,
			typePath);
	}
	
	/**
	 * Creates a new Uri from the specified input.
	 * 
	 * @param from If the parameter is omited,
	 * a unique internal URI is generated.
	 */
	static create(from?: X.Spine | X.Strand | Uri): Uri
	{
		if (from === undefined)
			return this.parse(UriProtocol.internal + "//" + Math.random().toString().slice(2))!;
		
		if (from instanceof X.Spine)
		{
			const srcUri = from.document.sourceUri;
			const typeSegments = from.vertebrae
				.map(span => span.subject.toString());
			
			return new Uri(
				srcUri.protocol,
				srcUri.fileName,
				srcUri.ioPath,
				typeSegments);
		}	
		
		if (from instanceof X.Strand)
		{
			const mols = from.molecules;
			if (mols.length === 0)
				throw X.Exception.unknownState();
			
			const spans = mols[0].localAtom.spans;
			if (spans.length === 0)
				throw X.Exception.unknownState();
			
			const srcUri = spans[0].statement.document.sourceUri;
			const typeSegments = from.molecules
				.map(m => m.localAtom.subject.toString());
			
			return new Uri(
				srcUri.protocol,
				srcUri.fileName,
				srcUri.ioPath,
				typeSegments);
		}
		
		if (from instanceof X.Uri)
			return from;
		
		throw X.Exception.unknownState();
	}
	
	/** */
	protected constructor(
		/**
		 * Stores a reference to the protocol used by the URI.
		 */
		readonly protocol: UriProtocol,
		
		/**
		 * Stores the file name specified in the URI, if one exists.
		 */
		readonly fileName: string,
		
		/** 
		 * Stores the fully qualified path to the file, and the file
		 * name itself, but without any protocol.
		 */
		readonly ioPath: ReadonlyArray<string>,
		
		/**
		 * Stores the contents of any type path specified in the URI.
		 */
		readonly typePath: ReadonlyArray<string>)
	{ }
	
	/**
	 * Converts the URI to a fully-qualified path including the file name.
	 * 
	 * @param includeProtocol Whether the protocol portion of the URI
	 * should be included in the final string. Defaults to true.
	 * 
	 * @param includeTypePath Whether the typePath portion of the URI
	 * should be included in the final string. Defaults to false.
	 */
	toString(includeProtocol = true, includeTypePath = false)
	{
		let out = "";
		
		if (includeProtocol)
			out += this.protocol + "//";
		
		out += Path.join(...this.ioPath.map(s => encodeURIComponent(s)));
		
		if (includeTypePath && this.typePath.length > 0)
		{
			const typePath = Path.join(...this.typePath.map(s => encodeURIComponent(s)));
			if (typePath !== "")
				out += X.Syntax.typePathSeparator + typePath;
		}
		
		return out;
	}
	
	/** 
	 * @returns A value indicating whether two URIs point to the same resource.
	 */
	equals(uri: Uri | string, compareTypePaths = false)
	{
		if (this === uri)
			return true;
		
		const thisText = this.toString(true, compareTypePaths);
		
		if (uri instanceof X.Uri)
			return thisText === uri.toString(true, compareTypePaths);
		
		return thisText === uri;
	}
	
	/**
	 * Creates a new Uri, whose typePath and ioPath
	 * fields are retracted by the specified levels of
	 * depth.
	 * 
	 * @returns A new Uri that is otherwise a copy of this 
	 * one, but with it's IO path and type path peeled
	 * back by the specified number of levels.
	 */
	retract(ioRetraction = 0, typeRetraction = 1)
	{
		if (typeRetraction > this.typePath.length)
			throw X.Exception.invalidUriRetraction();
		
		if (ioRetraction > this.ioPath.length)
			throw X.Exception.invalidUriRetraction();
		
		return new Uri(
			this.protocol,
			this.fileName,
			this.ioPath.slice(0, ioRetraction ? -ioRetraction : undefined),
			this.typePath.slice(0, -typeRetraction));
	}
	
	/**
	 * Creates a new Uri, whose typePath field is
	 * retracted to the specified level of depth.
	 */
	retractTo(typePathLength: number)
	{
		return typePathLength < this.typePath.length ?
			this.retract(0, this.typePath.length - typePathLength) :
			this;
	}
	
	/**
	 * @returns A new Uri, whose typePath and ioPath
	 * fields are extended with the specified segments.
	 */
	extend(ioSegments: string | string[], typeSegments: string | string[])
	{
		const ioSegmentsArray = typeof ioSegments === "string" ?
			[ioSegments] :
			ioSegments;
		
		const typeSegmentsArray = typeof typeSegments === "string" ?
			[typeSegments] :
			typeSegments;
		
		return new Uri(
			this.protocol,
			this.fileName,
			this.ioPath.concat(...ioSegmentsArray.filter(s => s)),
			this.typePath.concat(...typeSegmentsArray.filter(s => s)));
	}
}
