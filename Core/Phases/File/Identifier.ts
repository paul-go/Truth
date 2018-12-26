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
	 * @deprecated
	 * Calculates whether this Subject is structurally equal to another.
	 */
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
		return this.value + (this.isList ? X.Syntax.list : "");
	}
}
