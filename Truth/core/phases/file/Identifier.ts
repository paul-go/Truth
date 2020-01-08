
namespace Truth
{
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
			const listTok = Syntax.list;
			const tokLen = listTok.length;
			this.isList = text.length > tokLen + 1 && text.slice(-tokLen) === listTok;
			this.fullName = text;
			this.typeName = this.isList ? text.slice(0, -tokLen) : text;
		}
		
		/**
		 * Stores a full string representation of the subject, 
		 * as it appears in the document.
		 */
		readonly fullName: string;
		
		/**
		 * Stores a string representation of the name of the
		 * type to which the subject refers, without any List
		 * operator suffix.
		 */
		readonly typeName: string;
		
		/** */
		readonly isList: boolean;
		
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
						return this.typeName;
					
					case IdentifierEscapeKind.declaration:
					{
						// Regex delimiters are escaped if and only if 
						// they're the first character in an Identifier.
						const dlmReg = new RegExp("^" + RegexSyntaxDelimiter.main);
						const jntRegS = new RegExp(Syntax.joint + Syntax.space);
						const jntRegT = new RegExp(Syntax.joint + Syntax.tab);
						const cmbReg = new RegExp(Syntax.combinator);
						
						return this.typeName
							.replace(dlmReg, Syntax.escapeChar + RegexSyntaxDelimiter.main)
							.replace(jntRegS, Syntax.escapeChar + Syntax.joint + Syntax.space)
							.replace(jntRegT, Syntax.escapeChar + Syntax.joint + Syntax.tab)
							.replace(cmbReg, Syntax.escapeChar + Syntax.combinator);
					}
					
					case IdentifierEscapeKind.annotation:
					{
						const reg = new RegExp(Syntax.combinator);
						const rep = Syntax.escapeChar + Syntax.combinator;
						return this.typeName.replace(reg, rep);
					}
				}
			})();
			
			return val + (this.isList ? Syntax.list : "");
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
}
