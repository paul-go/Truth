
namespace Truth
{
	/**
	 * Asynchronously reads a truth document, and all documents
	 * it references from the specified file system or HTTP(s) path.
	 * File system paths are only supported if this code is running
	 * within a Node.js-compatible environment.
	 * 
	 * @returns A reference to the document read, or an Error.
	 */
	export async function read(
		sourcePathOrUri: string,
		targetProgram = new Program())
	{
		let uri = KnownUri.fromString(sourcePathOrUri);
		if (!uri)
		{
			const env = Misc.guessEnvironment();
			
			if (env === ScriptEnvironment.browser)
			{
				uri = KnownUri.fromString(sourcePathOrUri, window.location.href);
			}
			else if (env === ScriptEnvironment.node)
			{
				const pathRequire = require("path") as typeof import("path");
				let path = sourcePathOrUri;
				
				if (!pathRequire.isAbsolute(path))
					path = pathRequire.join(process.cwd(), path);
				
				uri = KnownUri.fromString("file://" + path);
			}
			else throw Exception.unsupportedPlatform();
		}
		
		return await targetProgram.addDocumentFromUri(uri!);
	}
	
	/**
	 * Parses the specified truth content into a new Truth program.
	 * 
	 * @returns A reference to the parsed document.
	 */
	export async function parse(
		sourceText: string,
		targetProgram = new Program())
	{
		return await targetProgram.addDocument(sourceText);
	}
}
