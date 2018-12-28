
/** @internal */
export class Exception
{
	/** */
	static invalidArgument()
	{
		debugger; return error(`Invalid argument.`);
	}
	
	/** */
	static unknownState()
	{
		debugger; return error(`An unknown state has been reached in the program.`);
	}
	
	/** */
	static invalidCall()
	{
		debugger; return error(`Cannot call this method given the current state of the program.`);
	}
	
	/** */
	static notImplemented()
	{
		debugger; return error(`Not implemented.`);
	}
	
	/** */
	static agentInvalid(rawUri: string)
	{
		debugger; return error(`File at URI ${rawUri} is not an agent.`);
	}
	
	/** */
	static agentNotRead()
	{
		debugger; return error(`
			Cannot instantiate an agent of this type,
			added. See agents.add.`);
	}
	
	/** */
	static agentMissing(rawUri: string)
	{
		debugger; return error(`Could not load an agent from the URI ${rawUri}`);
	}
	
	/** */
	static doubleTransaction()
	{
		debugger; return error(`Cannot start a new transaction while another is executing.`);
	}
	
	/** */
	static invalidUriRetraction()
	{
		debugger; return error(`URI contains too few path segments to perform this retraction.`);
	}
	
	/** */
	static invalidUri(rawUri?: string)
	{
		debugger; return error(`Invalid URI` + (typeof rawUri === "string" ? ": " + rawUri : ""));
	}
	
	/** */
	static invalidExtension(requiredExtension: string)
	{
		debugger; return error(`
			This method requires URIs that have the 
			".${requiredExtension}" extension.`);
	}
	
	/** */
	static invalidDocumentReference()
	{
		debugger; return error(`
			This document cannot be added as a dependency
			of the target document because it's storage location
			(memory or disk) differs from the that of the target.`);
	}
	
	/** */
	static nonEmptyDocument()
	{
		debugger; return error(`Cannot call this method on a non-empty document.`);
	}
	
	/** */
	static uncachableDocument()
	{
		debugger; return error(`
			Cannot cache this document because it was not loaded from a file.`);
	}
	
	/** */
	static documentAlreadyLoaded()
	{
		debugger; return error(`
			A document with this URI has already been created.
			Use Document.fromUri() instead.`);
	}
	
	/** */
	static documentNotLoaded()
	{
		debugger; return error(`This document has not been loaded into the current program.`);
	}
	
	/** */
	static uriNotSupported()
	{
		debugger; return error(`URIs of this type are not supported.`);
	}
	
	/** */
	static cannotRefresh()
	{
		debugger; return error(`
			This resource cannot be reloaded because it only exists in memory.`);
	}
	
	/** */
	static offsetRequired()
	{
		debugger; return error(`
			Offset argument is required because the a whitespace-only
			statement was passed.`);
	}
}


/**
 * Generates a proper error object from the specified message.
 */
function error(msg: string)
{
	return new Error(msg.trim().replace(/\s\s+/g, " "));
}
