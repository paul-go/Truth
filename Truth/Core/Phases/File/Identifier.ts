import * as X from "../../X";


/**
 * A class that represents a single subject in a Statement.
 * Consumers of this class should not expect Subject objects
 * to be long-lived, as they are discarded regularly after edit
 * transactions complete.
 */
export class Identifier
{
	/** */
	constructor(text: string)
	{
		this.value = text;
		const listTok = X.Syntax.list;
		const len = listTok.length;
		
		if (text.length > len + 1)
		{
			this.isList = text.slice(-len) === listTok;
			this.value = text.slice(
				0,
				this.isList ? text.length - len : undefined);
			
			if (!this.isList)
			{
				const te = X.Syntax.truthExtension;
				const ae = X.Syntax.agentExtension;
				
				// Perform a simple check to see if there is a known 
				// file extension at the end of the the URI, before we 
				// actually attempt to parse it.
				if (text.slice(-te.length - 1) === "." + te || text.slice(-ae.length - 1) === "." + ae)
					this.uri = X.Uri.parse(text);
			}
		}
	}
	
	/**
	 * Stores a full string representation of the subject, 
	 * as it appears in the document.
	 */
	readonly value: string;
	
	/** */
	readonly isList: boolean = false;
	
	/** 
	 * Stores a parsed URI object, in the case the subject is
	 * formatted as a URI. In other cases, the field is null.
	 */
	readonly uri: X.Uri | null = null;
	
	/** Calculates whether this Subject is structurally equal to another. */
	equals(other: Identifier | string | null)
	{
		if (other instanceof Identifier)
			return (
				this.value === other.value &&
				this.isList === other.isList
			);
		
		return false;
	}
	
	/** Converts this Subject to it's string representation. */
	toString()
	{
		return this.uri ?
			this.uri.toString() :
			this.value + (this.isList ? X.Syntax.list : "");
	}
}
