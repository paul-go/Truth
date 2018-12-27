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
	
	/**
	 * Converts this Subject to it's string representation. 
	 * @param escape If true, preserves any necessary
	 * escaping required to ensure the identifier string
	 * is in a parsable format.
	 */
	toString(escape = IdentifierEscapeKind.none)
	{
		const val = (() =>
		{
			switch (escape)
			{
				case IdentifierEscapeKind.none:
					return this.value;
				
				case IdentifierEscapeKind.declaration:
				{
					// Regex delimiters are escaped if and only if 
					// they're the first character in an Identifier.
					const dlmReg = new RegExp("^" + X.RegexSyntaxDelimiter.main);
					const jntRegS = new RegExp(X.Syntax.joint + X.Syntax.space);
					const jntRegT = new RegExp(X.Syntax.joint + X.Syntax.tab);
					const cmbReg = new RegExp(X.Syntax.combinator);
					
					return this.value
						.replace(dlmReg, X.Syntax.escapeChar + X.RegexSyntaxDelimiter.main)
						.replace(jntRegS, X.Syntax.escapeChar + X.Syntax.joint + X.Syntax.space)
						.replace(jntRegT, X.Syntax.escapeChar + X.Syntax.joint + X.Syntax.tab)
						.replace(cmbReg, X.Syntax.escapeChar + X.Syntax.combinator);
				}
				
				case IdentifierEscapeKind.annotation:
				{
					const reg = new RegExp(X.Syntax.combinator);
					const rep = X.Syntax.escapeChar + X.Syntax.combinator;
					return this.value.replace(reg, rep);
				}
			}
		})()
		
		return val + (this.isList ? X.Syntax.list : "");
	}
}


/**
 * An enumeration that describes the various ways
 * to handle escaping when serializing an identifier.
 * This enumeration is used to address the differences
 * in the way identifiers can be serialized, which can 
 * depend on whether the identifier is a declaration or
 * an annotation.
 */
export const enum IdentifierEscapeKind
{
	none = 0,
	declaration = 1,
	annotation = 2
}
