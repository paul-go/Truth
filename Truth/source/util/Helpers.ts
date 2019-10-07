
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
	export async function read(truthFilePathOrUri: string)
	{
		const program = new Program();
		return await program.documents.read(truthFilePathOrUri);
	}

	/**
	 * Parses the specified truth content into a new Truth program.
	 * 
	 * @returns A reference to the parsed document.
	 */
	export async function parse(truthContent: string)
	{
		const program = new Program();
		return await program.documents.create(truthContent);
	}
}
