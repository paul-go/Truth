		
declare namespace Reflex.ML
{
	/**
	 * 
	 */
	interface IEmitOptions
	{
		/**
		 * Whether or not the generated HTML and JavaScript
		 * should be formatted with whitespace characters.
		 * Default is true.
		 */
		format?: boolean;
		
		/**
		 * Whether or not the <!DOCTYPE html> directive
		 * should be emitted at the top of the generated HTML.
		 * Default is true.
		 */
		doctype?: boolean;
		
		/**
		 * Specifies the URL for the inline <script> tag that
		 * points to the restore script, if a restore script is
		 * necessary. If empty, the restore script is inlined
		 * within the generated HTML.
		 * 
		 * The URI should include a file name, such as "restore.js".
		 * 
		 * If the provided HTML structure contains no recurrent
		 * function attachments (events, promises, async iterables),
		 * no restore script is generated.
		 */
		restoreScriptURI?: string;
		
		/**
		 * Specifies the file system directory where the generated
		 * restore script file should be written. Uses the file system
		 * access APIs available to the detected environment (current,
		 * the only supported environment is Node.js). 
		 * 
		 * The name of the file is extracted from the restoreScriptURI
		 * property. If this property is omitted, no external restore script
		 * is generated, and this property therefore has no effect.
		 */
		restoreScriptOutPath?: string;
		
		/**
		 * Specifies a file system path where the generated
		 * HTML file should be written. Uses the file system access
		 * APIs available to the detected environment (current, the
		 * only supported environment is Node.js). A directory may
		 * be specified, in which case, the file name "index.html" is
		 * used.
		 * 
		 * If omitted or empty, the generated HTML file is not written
		 * to the file system.
		 */
		htmlOutPath?: string;
	}
	
	/**
	 * Stores strings that contain the emitted HTML and
	 * restoration JavaScript used to render the page.
	 */
	interface IEmitResult
	{
		readonly html: string;
		readonly js: string;
	}
	
	interface Namespace
	{
		//
		// Everything defined in this interface will eventually be merged
		// with the global "ml" object defined in the ReflexML library.
		//
		
		/**
		 * Serializes the specified DOM Node instance.
		 */
		emit(target: Node | Node[], options?: IEmitOptions): Promise<IEmitResult>;
	}
}
