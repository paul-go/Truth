import * as X from "./X";
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
	/** */
	static create(uri: Uri | string, relativeTo: Uri | X.Document | null = null): Uri | null
	{
		if (uri instanceof Uri)
			return uri;
		
		if (/\.[a-z]{1,}$/.test(uri))
			return new Uri(uri, relativeTo);
		
		return null;
	}
	
	/** Creates a type URI from the specified Spine object. */
	static createFromSpine(spine: X.Spine): Uri
	{
		const path = spine.nodes.map(node => node.subject).join("/");
		return new Uri(path, spine.document);
	}
	
	/** Creates a unique internal URI. */
	static createInternal()
	{
		return new Uri("system-internal://" + Math.random().toString().slice(2));
	}
	
	/** */
	protected constructor(rawUri: string, relativeTo: Uri | X.Document | null = null)
	{
		const detectedType = (() =>
		{
			const table = {
				"//": UriProtocol.https,
				"https://": UriProtocol.https,
				"http://": UriProtocol.http,
				"file://": UriProtocol.file,
				"system-internal://": UriProtocol.internal
			}; 
			
			for (const [scheme, type] of Object.entries(table))
				if (rawUri.startsWith(scheme))
					return type;
			
			if (/^([A-Za-z]+-?)+:/.test(rawUri))
				return UriProtocol.unsupported;
			
			return UriProtocol.none;
		})();
		
		if (detectedType === UriProtocol.unsupported)
			throw X.ExceptionMessage.uriNotSupported();
		
		const uriNoProto = rawUri.replace(/^([a-z][a-z0-9-.+]*:)?\/\//, "");
		const [filePath, typePath] = uriNoProto.split("//", 2);
		const filePathParts = filePath.split("/");
		
		this.ioPath = filePath;
		this.typePath = typePath ? typePath.split("/") : [];
		
		if (filePathParts.length)
		{
			const lastFilePathPart = filePathParts[filePathParts.length - 1];
			const dotPos = lastFilePathPart.lastIndexOf(".");
			
			if (dotPos >= 0)
			{
				this.fileName = lastFilePathPart;
				this.fileNameBase = lastFilePathPart.slice(0, dotPos);
				this.fileExtension = lastFilePathPart.slice(dotPos + 1);
			}
		}
		
		// If there is no detected type, then we need
		// to look to the relativeTo argument to create
		// the fully qualified path.
		if (detectedType === UriProtocol.none)
		{
			const relativeUri =
				relativeTo instanceof Uri ? relativeTo :
				relativeTo instanceof X.Document ? relativeTo.sourceUri :
				null;
			
			if (relativeUri)
			{
				const prot = relativeUri.protocol;
				
				if (prot === UriProtocol.file)
					this.ioPath = Path.resolve(relativeUri.ioPath, rawUri);
				
				else if (prot === UriProtocol.https || prot === UriProtocol.http)
					this.ioPath = "";
				
				else throw X.ExceptionMessage.notImplemented();
				
				this.protocol = prot;
			}
			else
			{
				// If there is no detected type, and the relativeUri
				// argument wasn't specified, we assume that the
				// URI refers to a local file, relative to the current
				// working directory.
				this.protocol = UriProtocol.file;
				this.ioPath = Path.resolve(rawUri);
			}
		}
		// If we have a detected type (meaning one that isn't "none"), 
		// then it doesn't matter what the relativeTo argument is,
		// because we've already got an absolute URI.
		else
		{
			this.protocol = detectedType;
		}
	}
	
	/**
	 * Stores a reference to the protocol used by the URI.
	 */
	readonly protocol: UriProtocol;
	
	/**
	 * Stores the file name specified in the URI, if one exists.
	 */
	readonly fileName: string = "";
	
	/**
	 * Stores the base file name specified in the URI.
	 * For example, for the URI path/to/dir/file.ext, base would
	 * be the string "file". If the URI does not contain a file
	 * name, the field is an empty string.
	 */
	readonly fileNameBase: string = "";
	
	/**
	 * Stores the extension of the file specified in the URI,
	 * without the dot character. If the URI does not contain
	 * a file name, the field is an empty string.
	 */
	readonly fileExtension: string = "";
	
	/** 
	 * Stores the fully qualified path to the file, and the file
	 * name itself, but without any protocol.
	 */
	readonly ioPath: string = "";
	
	/**
	 * Stores the contents of any type path specified in the URI.
	 */
	readonly typePath: ReadonlyArray<string> = [];
	
	/**
	 * Converts the URI to a fully-qualified path including the file name.
	 */
	toString(includeProtocol?: boolean, includeTypePath?: boolean)
	{
		const proto = includeProtocol ?
			UriProtocol[this.protocol] + "://" :
			"";
		
		const ioPath = Path.join(this.ioPath);
		const typePath = includeTypePath ?
			"//" + this.typePath.map(s => s.replace(/\//g, "\\/")).join("/") : 
			"";
		
		return proto + ioPath + typePath;
	}
	
	/** 
	 * @returns A value indicating whether two URIs point to the same resource.
	 */
	equals(uri: Uri | string)
	{
		return this === uri || this.toString() === uri.toString();
	}
	
	/**
	 * @returns A copy of this Uri, but with mutable properties.
	 */
	toMutable()
	{
		const rawUri = this.toString();
		const self = this;
		
		return new class MutableUri extends Uri
		{
			/** */
			constructor()
			{
				super(rawUri);
			}
			
			/** */
			ioPath = self.ioPath;
			
			/** */
			typePath = self.typePath;
			
			/** Creates an immutable URI from this MutableUri object. */
			freeze(): Uri
			{
				return Object.freeze(new Uri(this.toString()));
			}
		}
	}
}
