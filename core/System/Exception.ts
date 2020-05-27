
namespace Truth
{
	/** @internal */
	export class Exception
	{
		/** */
		static typeDirty(type: Type)
		{
			return error(`
				Cannot call this method or access this property,
				because the document has changed since it
				was created. Affected type is: ` + type.name);
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
		static unknownState(customMessage: string = "")
		{
			return error("An unknown state has been reached in the program." + 
				customMessage ? " Custom error message was:\n" + customMessage : "");
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
		static invalidEditSequence()
		{
			return error(`
				Invalid edit sequence. Updates must exist in isolation, 
				and deletes may not follow inserts.`);
		}
		
		/** */
		static cannotDeclareTraitsOnNonEmptyProgram()
		{
			return error(
				`Cannot declare traits on non-empty programs. ` +
				`Be sure to call this function before all documents ` +
				`have been added to the program`);
		}
		
		/** */
		static classAlreadyExists(name: string)
		{
			return error(`A class with the name "${name}" ` +
				`has already been declared in this program.`);
		}
		
		/** */
		static scriptMissing(rawUri: string)
		{
			return error(`Could not load a script from ${rawUri}`);
		}
		
		/** */
		static scriptLoadError(agentUri: string, errorText: string)
		{
			return error(`
				An error occured while trying to evaluate the script at "${agentUri}".
				The error message returned was: ${errorText}`);
		}
		
		/** */
		static scriptInvalid(rawUri: string = "")
		{
			return error(`
				The ${rawUri ? "code file at " + rawUri : "script"} does not conform
				to the expected format. Consider looking at the documention and
				examples for the proper way to stucture a code file.`);
		}
		
		/** */
		static documentImmutable()
		{
			return error(`Cannot call this method on this document because it is immutable.`);
		}
		
		/** */
		static noRemoteScripts()
		{
			return error(`
				Scripts cannot be loaded from remote URIs in this context.
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
		static programHasNoDocuments()
		{
			return error(`
				Cannot call this method because the containing Program has
				no loaded documents. You must add at least one document in order
				to use this method.`);
		}
		
		/** */
		static programNotVerified()
		{
			return error(`
				Cannot call this method because the program is not currently
				in a fully verified state.`);
		}
		
		/** */
		static doubleTransaction()
		{
			return error("Cannot start a new transaction while another is executing.");
		}
		
		/** */
		static invalidUri(rawUri: string = "")
		{
			return error("Invalid URI" + (typeof rawUri === "string" ? ": " + rawUri : ""));
		}
		
		/** */
		static uriNotSupported()
		{
			return error("URIs of this type are not supported.");
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
		static invalidOperationOnHypotheticalPhrase()
		{
			return error(`
				Cannot perform this operation on a Phrase, because it refers
				to an area of a document that only exists hypothetically.`);
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
		static documentEmptyCannotRead()
		{
			return error(`
				Cannot read from this document because it contains no statements.`);
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
		static documentContainsInvalidHomograph()
		{
			return error("An invalid homograph was detected at the location specified.");
		}
		
		/** */
		static unexpectedHomograph()
		{
			return error("An unexpected homographs was encountered.");
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
