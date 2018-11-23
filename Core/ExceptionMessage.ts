
/** @internal */
export class ExceptionMessage
{
	/** */
	static invalidArgument()
		{ return `Invalid argument.`; }
	
	/** */
	static unknownState()
		{ return `An unknown state has been reached in the program.`; }
	
	/** */
	static invalidCall()
		{ return `Cannot call this method given the current state of the program.`; }
	
	/** */
	static notImplemented()
		{ return `Not implemented.`; }
	
	/** */
	static agentInvalid(rawUri: string)
		{ return `File at URI ${rawUri} is not an agent.`; }
	
	/** */
	static agentNotRead()
		{ return `Cannot instantiate an agent of this type, because it has not been added. See agents.add.`; }
	
	/** */
	static agentMissing(rawUri: string)
		{ return `Could not load an agent from the URI ${rawUri}`; }
	
	/** */
	static doubleTransaction()
		{ return `Cannot start a new transaction while another is executing.`; }
	
	/** */
	static invalidUriRetraction()
		{ return `URI contains too few path segments to perform this retraction.`; }
	
	/** */
	static invalidUri(rawUri?: string)
		{ return `Invalid URI` + (typeof rawUri === "string" ? ": " + rawUri : ""); }
	
	/** */
	static invalidExtension(requiredExtension: string)
		{ return `This method requires URIs that have the ".${requiredExtension}" extension.`; }
	
	/** */
	static invalidDocumentReference()
	{
		return "This document cannot be added as a dependency of the target document " +
			"because it's storage location (memory or disk) differs from the that of the target.";
	}
	
	/** */
	static nonEmptyDocument()
		{ return `Cannot call this method on a non-empty document.`; }
	
	/** */
	static uncachableDocument()
		{ return `Cannot cache this document because it was not loaded from a file.`; }
	
	/** */
	static documentAlreadyLoaded()
		{ return `A document with this URI has already been created. Use Document.fromUri() instead.`; }
	
	/** */
	static documentNotLoaded()
		{ return `This document has not been loaded into the current program.`; }
	
	/** */
	static uriNotSupported()
		{ return `URIs of this type are not supported.`; }
	
	/** */
	static cannotRefresh()
		{ return `This resource cannot be reloaded because it only exists in memory.`; }
	
	/** */
	static offsetRequired()
		{ return `Offset argument is required because the a whitespace-only statement was passed.`; }
}
