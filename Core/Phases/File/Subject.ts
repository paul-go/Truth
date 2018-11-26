import * as X from "./X";


/**
 * A class that represents a single subject in a Statement.
 * Consumers of this class should not expect Subject objects
 * to be long-lived, as they are discarded regularly after edit
 * transactions complete.
 */
export class Subject
{
	/** */
	constructor(text: string)
	{
		this.uri = null;
		
		const token = X.Syntax.pluralizer;
		const len = token.length;
		
		if (text.length > len + 1)
		{
			this.pluralized = text.slice(-len) === token;
			this.name = text.slice(
				0,
				this.pluralized ? text.length - len : undefined);
			
			if (!this.pluralized)
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
		else
		{
			this.name = text;
			this.pluralized = false;
		}
	}
	
	/** */
	readonly name: string;
	
	/** */
	readonly pluralized: boolean;
	
	/** 
	 * Stores a related URI when in the subject is
	 * formatted as such. In other cases, the field
	 * is an empty string.
	 */
	readonly uri: X.Uri | null;
	
	/**
	 * Stores a regular expression pattern object when
	 * the subject is formatted as such. In other cases, 
	 * the field is null.
	 * 
	 * (Are Pattern objects referentially significant?)
	 */
	readonly pattern: X.Pattern | null = null;
	
	/** Calculates whether this Subject is structurally equal to another. */
	equals(other: Subject | string | null)
	{
		if (other instanceof Subject)
			return (
				this.name === other.name &&
				this.pluralized === other.pluralized
			);
		
		return false;
	}
	
	/** Converts this Subject to it's string representation. */
	toString()
	{
		return this.uri ?
			this.uri.toString() :
			this.name + (this.pluralized ? X.Syntax.pluralizer : "");
	}
}
