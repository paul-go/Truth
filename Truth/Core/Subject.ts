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
			this.singularized = text.slice(0, len) === token;
			this.name = text.slice(
				this.singularized ? len : 0,
				this.pluralized ? text.length - len : undefined);
			
			if (!this.singularized && !this.pluralized)
			{
				const te = X.Syntax.truthExtension;
				const ae = X.Syntax.agentExtension;
				
				// Perform a simple check to see if there is a known 
				// file extension at the end of the the URI, before we 
				// actually attempt to parse it.
				if (text.slice(-te.length - 1) === "." + te || text.slice(-ae.length - 1) === "." + ae)
					this.uri = X.Uri.create(text);
			}
		}
		else
		{
			this.name = text;
			this.pluralized = this.singularized = false;
		}
	}
	
	/** */
	readonly name: string;
	
	/** */
	readonly pluralized: boolean;
	
	/** */
	readonly singularized: boolean;
	
	/** 
	 * Stores the text of the URI when in the subject is
	 * formatted as such. When the subject does not
	 * form a URI, this field is an empty string.
	 */
	readonly uri: X.Uri | null;
	
	/** Calculates whether this Subject is structurally equal to another. */
	equals(other: Subject | string | null)
	{
		if (other instanceof Subject)
			return (
				this.name === other.name &&
				this.pluralized === other.pluralized &&
				this.singularized === other.singularized
			);
		
		return false;
	}
	
	/** Converts this Subject to it's string representation. */
	toString()
	{
		if (this.uri)
			return this.uri.toString();
		
		const p = X.Syntax.pluralizer;
		return (this.singularized ? p : "") + this.name + (this.pluralized ? p : "");
	}
}
