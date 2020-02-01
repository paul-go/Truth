
namespace Truth
{
	/** @internal */
	export class Exception
	{
		/** */
		static objectDirty()
		{
			return error(`
				Cannot call this method or access this property,
				because the document has changed since it
				was created.`);
		}
		
		/** */
		static invalidArgument()
		{
			return error("Invalid argument.");
		}
		
		/** */
		static passedArrayCannotBeEmpty(paramName: string)
		{
			return error("Array cannot be empty for parameter: " + paramName);
		}
		
		/** */
		static unknownState()
		{
			return error("An unknown state has been reached in the program.");
		}
		
		/** */
		static invalidCall()
		{
			return error("Cannot call this method given the current state of the program.");
		}
		
		/** */
		static notImplemented()
		{
			return error("Not implemented.");
		}
		
		/** */
		static agentNotRead()
		{
			return error(`
				Cannot instantiate an agent of this type,
				added. See agents.add.`);
		}
		
		/** */
		static agentMissing(rawUri: string)
		{
			return error(`Could not load an agent from the URI ${rawUri}`);
		}
		
		/** */
		static agentImportError(agentUri: string, errorText: string)
		{
			return error(`
				An error occured while trying to evaluate the agent at "${agentUri}".
				The error message returned was: ${errorText}`);
		}
		
		/** */
		static agentInvalid(rawUri: string)
		{
			return error(`
				The code file at ${rawUri} does not export a function. Consider looking
				at the documention and examples for the proper way to stucture an
				agent code file.`);
		}
		
		/** */
		static noRemoteAgents()
		{
			return error(`
				Agents cannot be loaded from remote URIs in this context.
				(Most likely, this code is running in Node.js where the loading
				of remote code is a security risk).`);
		}
		
		/** */
		static causeParameterNameInUse(paramName: string)
		{
			return error(`
				Cannot use the name "${paramName}" as a parameter
				name because it's already in use.`);
		}
		
		/** */
		static doubleTransaction()
		{
			return error("Cannot start a new transaction while another is executing.");
		}
		
		/** */
		static invalidUriRetraction()
		{
			return error("URI contains too few path segments to perform this retraction.");
		}
		
		/** */
		static invalidUri(rawUri?: string)
		{
			return error("Invalid URI" + (typeof rawUri === "string" ? ": " + rawUri : ""));
		}
		
		/** */
		static uriNotSupported()
		{
			return error("URIs of this type are not supported.");
		}
		
		/** */
		static cannotMakeAbsolute()
		{
			return error(`
				Cannot make this URI absolute because no 
				process or window object could be found`);
		}
		
		/** */
		static absoluteUriExpected()
		{
			return error(`This method expects an absolute URI to be specified.`);
		}
		
		/** */
		static mustSpecifyVia()
		{
			return error(`
				Must specify the "via" argument because the parsed URI 
				was found to be relative`);
		}
		
		/** */
		static viaCannotBeRelative()
		{
			return error(`URI instances specified in the "via" argument must not be relative`);
		}
		
		/** */
		static invalidTypePath()
		{
			return error(`
				One or more of the types in the specified type path are invalid,
				because they contain either leading or trailing whitespace, or
				is an empty string.`);
		}
		
		/** */
		static invalidExtension(requiredExtension: string)
		{
			return error(`
				This method requires URIs that have the 
				".${requiredExtension}" extension.`);
		}
		
		/** */
		static invalidDocumentReference()
		{
			return error(`
				This document cannot be added as a dependency
				of the target document because it's storage location
				(memory or disk) differs from the that of the target.`);
		}
		
		/** */
		static uriAlreadyExists()
		{
			return error(`
				Cannot assign this URI to this document, because
				another document is already loaded in the program
				with the Uri specified.`);
		}
		
		/** */
		static uriProtocolsMustMatch()
		{
			return error(`
				Cannot assign this URI to this document, because
				it's protocol differs from the URI current assigned 
				to this document`);
		}
		
		/** */
		static nonEmptyDocument()
		{
			return error("Cannot call this method on a non-empty document.");
		}
		
		/** */
		static invalidWhileInEditTransaction()
		{
			return error(
				`Cannot call this method, or run this hook while an edit
				transaction is underway.`);
		}
		
		/** */
		static uncachableDocument()
		{
			return error(`
				Cannot cache this document because it was not loaded from a file.`);
		}
		
		/** */
		static documentAlreadyLoaded()
		{
			return error(`
				A document with this URI has already been created.
				Use Document.fromUri() instead.`);
		}
		
		/** */
		static documentNotLoaded()
		{
			return error("This document has not been loaded into the current program.");
		}
		
		/** */
		static statementNotInDocument()
		{
			return error("The specified statement does not exist within this document.");
		}
		
		/** */
		static cannotRefresh()
		{
			return error(`
				This resource cannot be reloaded because it only exists in memory.`);
		}
		
		/** */
		static offsetRequired()
		{
			return error(`
				Offset argument is required because the a whitespace-only
				statement was passed.`);
		}
		
		/** */
		static unsupportedPlatform()
		{
			return error("This code appears to be operating in an unsupported platform.");
		}
	}
	
	/**
	 * Generates a proper error object from the specified message.
	 */
	function error(msg: string)
	{
		return new Error(msg.trim().replace(/\s\s+/g, " "));
	}
}
