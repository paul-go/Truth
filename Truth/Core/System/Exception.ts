
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
		return error(`Invalid argument.`);
	}
	
	/** */
	static unknownState()
	{
		return error(`An unknown state has been reached in the program.`);
	}
	
	/** */
	static invalidCall()
	{
		return error(`Cannot call this method given the current state of the program.`);
	}
	
	/** */
	static notImplemented()
	{
		return error(`Not implemented.`);
	}
	
	/** */
	static agentInvalid(rawUri: string)
	{
		return error(`File at URI ${rawUri} is not an agent.`);
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
	static doubleTransaction()
	{
		return error(`Cannot start a new transaction while another is executing.`);
	}
	
	/** */
	static invalidUriRetraction()
	{
		return error(`URI contains too few path segments to perform this retraction.`);
	}
	
	/** */
	static invalidUri(rawUri?: string)
	{
		return error(`Invalid URI` + (typeof rawUri === "string" ? ": " + rawUri : ""));
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
	static nonEmptyDocument()
	{
		return error(`Cannot call this method on a non-empty document.`);
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
		return error(`This document has not been loaded into the current program.`);
	}
	
	/** */
	static uriNotSupported()
	{
		return error(`URIs of this type are not supported.`);
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
}


/**
 * Generates a proper error object from the specified message.
 */
function error(msg: string)
{
	return new Error(msg.trim().replace(/\s\s+/g, " "));
}
