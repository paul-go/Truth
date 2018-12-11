import * as X from "../X";
import * as Path from "path";


/** */
export enum UriProtocol
{
	none,
	file,
	https,
	http,
	internal,
	unsupported
}

/** */
const UriProtocolPrefix: { [prefix: string]: UriProtocol; } = {
	"//": UriProtocol.https,
	"https://": UriProtocol.https,
	"http://": UriProtocol.http,
	"file://": UriProtocol.file,
	"system-internal://": UriProtocol.internal
};

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
	 * 
	 * @param uriText A string containing the URI to parse
	 * @param relativeFallback A URI that identifies the origin
	 * of the URI being parsed, used in the case when the
	 * uriText parameter is a relative path.
	 */
	static parse(uriText: string, relativeFallback?: Uri): Uri | null
	{
		let protocol = (() =>
		{
			for (const [scheme, type] of Object.entries(UriProtocolPrefix))
				if (uriText.startsWith(scheme))
					return type;
			
			if (/^([A-Za-z]+-?)+:/.test(uriText))
				return UriProtocol.unsupported;
			
			return UriProtocol.none;
		})();
		
		if (protocol === UriProtocol.unsupported)
			throw X.ExceptionMessage.uriNotSupported();
		
		const [filePathFull, typePathFull] = uriText
			.replace(/^([a-z][a-z0-9-.+]*:)?\/\//, "")
			.split("//", 2);
		
		const filePathParts = filePathFull.split("/");
		
		let fileName = "";
		let fileNameBase = "";
		let fileExtension = "";
		let ioPath = filePathParts.slice();
		let typePath = typePathFull ? typePathFull.split("/") : [];
		
		if (filePathParts.length)
		{
			const lastFilePathPart = filePathParts[filePathParts.length - 1];
			const dotPos = lastFilePathPart.lastIndexOf(".");
			
			if (dotPos >= 0)
			{
				fileName = lastFilePathPart;
				fileNameBase = lastFilePathPart.slice(0, dotPos);
				fileExtension = lastFilePathPart.slice(dotPos + 1);
			}
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
				
				else throw X.ExceptionMessage.notImplemented();
				
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
			fileNameBase,
			fileExtension,
			ioPath,
			typePath);
	}
	
	/**
	 * Creates a new Uri from the specified input.
	 * 
	 * @param from If the parameter is omited, a unique internal
	 * URI is generated.
	 */
	static create(from?: X.Spine | X.Strand | Uri): Uri
	{
		if (from === undefined)
			return this.parse("system-internal://" + Math.random().toString().slice(2))!;
		
		if (from instanceof X.Spine)
		{
			const srcUri = from.document.sourceUri;
			const typeSegments = from.vertebrae.map(span => span.subject.toString());
			
			return new Uri(
				srcUri.protocol,
				srcUri.fileName,
				srcUri.fileNameBase,
				srcUri.fileExtension,
				srcUri.ioPath,
				typeSegments);
		}	
		
		if (from instanceof X.Strand)
		{
			const mols = from.molecules;
			if (mols.length === 0)
				throw X.ExceptionMessage.unknownState();
			
			const spans = mols[0].localAtom.spans;
			if (spans.length === 0)
				throw X.ExceptionMessage.unknownState();
			
			const srcUri = spans[0].statement.document.sourceUri;
			const typeSegments = from.molecules
				.map(m => m.localAtom.subject.toString());
			
			return new Uri(
				srcUri.protocol,
				srcUri.fileName,
				srcUri.fileNameBase,
				srcUri.fileExtension,
				srcUri.ioPath,
				typeSegments);
		}
		
		if (from instanceof X.Uri)
			return from;
		
		throw X.ExceptionMessage.unknownState();
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
		 * Stores the base file name specified in the URI.
		 * For example, for the URI path/to/dir/file.ext, base would
		 * be the string "file". If the URI does not contain a file
		 * name, the field is an empty string.
		 */
		readonly fileNameBase: string,
		
		/**
		 * Stores the extension of the file specified in the URI,
		 * without the dot character. If the URI does not contain
		 * a file name, the field is an empty string.
		 */
		readonly fileExtension: string,
		
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
		const proto = includeProtocol ?
			UriProtocol[this.protocol] + "://" :
			"";
		
		const ioPath = Path.join(...this.ioPath);
		const typePath = includeTypePath ?
			"//" + this.typePath.map(s => s.replace(/\//g, "\\/")).join("/") : 
			"";
		
		return proto + ioPath + typePath;
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
			throw X.ExceptionMessage.invalidUriRetraction();
		
		if (ioRetraction > this.ioPath.length)
			throw X.ExceptionMessage.invalidUriRetraction();
		
		return new Uri(
			this.protocol,
			this.fileName,
			this.fileNameBase,
			this.fileExtension,
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
			this.fileNameBase,
			this.fileExtension,
			this.ioPath.concat(...ioSegmentsArray.filter(s => s)),
			this.typePath.concat(...typeSegmentsArray.filter(s => s)));
	}
}
