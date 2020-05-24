
namespace Truth
{
	const hashRegex = new RegExp("[a-f0-9]{" + Hash.length + "}", "i");
	
	/**
	 * A reference type that encapsulates a unique term within a document.
	 * A term may be the name of a Type, such as "Product", or it may also
	 * be some alias to be matched by a pattern, such as "10cm".
	 */
	export class Term extends AbstractClass
	{
		/**
		 * Finds or creates a Term object whose inner textContent is equal
		 * to the textContent value specified. This method is used to acquire
		 * a reference to a Term, instead of using the Term constructor (which
		 * is private), to ensure that there is only ever one instance of a Term
		 * for each unique textContent value.
		 * 
		 * @returns A term object that corresponds to the string specified.
		 */
		static from(textContent: string)
		{
			return this.internalFrom(unescape(textContent), false);
		}
		
		/** */
		private static internalFrom(textContent: string, forceSingular: boolean)
		{
			return Misc.get(
				this.cache,
				textContent,
				() => new Term(textContent, forceSingular));
		}
		
		/**
		 * Stores a cache of all Terms created by the compiler.
		 */
		private static readonly cache = new Map<string, Term>();
		
		/**
		 * Stores a significant empty-string term, which is used as a marker term
		 * to represent what is eventually presented as an anonymous Type.
		 */
		static readonly anonymous = new Term("", true);
		
		/**
		 * Stores a significant empty string term, which is used as a marker term
		 * to represent a full statement that has been marked as as cruft (meaning
		 * that the statement is unparsable).
		 */
		static readonly cruft = new Term("", true);
		
		/** */
		private constructor(
			/**
			 * Stores the inner content of this Term.
			 */
			readonly textContent: string,
			forceSingular: boolean)
		{
			super();
			this.singular = this;
			this.hash = this.tryExtractHash(textContent);
			
			const listTok = Syntax.list;
			const tokLen = listTok.length;
			const isList = textContent.length > tokLen + 1 && textContent.slice(-tokLen) === listTok;
			
			if (isList && !forceSingular)
			{
				this.textContent = textContent.slice(0, -tokLen);
				this.singular = Term.internalFrom(this.textContent, true);
			}
		}
		
		/** @internal */
		readonly class = Class.term;
		
		/** */
		private tryExtractHash(text: string)
		{
			const delim = RegexSyntaxDelimiter.main;
			const delimEsc = escape(delim);
			const delimLen =
				text.startsWith(delim) ? delim.length :
				text.startsWith(delimEsc) ? delimEsc.length :
				-1;
			
			const hashLen = Hash.length;
			
			if (delimLen < 0 || text.length < delimLen + hashLen + 1)
				return "";
			
			const hash = text.substr(delimLen, hashLen);
			if (hash.length !== hashLen || !hashRegex.test(hash))
				return "";
			
			return hash;
		}
		
		/** Stores whether this component represents a pattern. */
		get isPattern() { return this.hash !== ""; }
		
		/**
		 * Stores a reference to the singular version of this Term.
		 * For example, in the case when the term's textContent is
		 * "SomeType...", this field refers to the Term object whose
		 * textContent is "SomeType".
		 * 
		 * In the case when this Term does not conform to the list syntax,
		 * the field stores a self-reference back to this Term object.
		 */
		readonly singular: Term;
		
		/**
		 * Gets whether this Term conforms to the list syntax.
		 */
		get isList()
		{
			return this.singular !== this;
		}
		
		/**
		 * Stores a pattern hash, in the case when this Term
		 * relates to a pattern. Stores an empty string in other cases.
		 */
		private readonly hash: string = "";
		
		/**
		 * Converts this Term to it's string representation. 
		 * @param escape If true, preserves any necessary
		 * escaping required to ensure the term string
		 * is in a parsable format.
		 */
		toString(escape = TermEscapeKind.none)
		{
			const val = (() =>
			{
				switch (escape)
				{
					case TermEscapeKind.none:
						return this.textContent;
					
					case TermEscapeKind.declaration:
					{
						// Regex delimiters are escaped if and only if 
						// they're the first character in a term.
						const dlmReg = new RegExp("^" + RegexSyntaxDelimiter.main);
						const jntRegS = new RegExp(Syntax.joint + Syntax.space);
						const jntRegT = new RegExp(Syntax.joint + Syntax.tab);
						const cmbReg = new RegExp(Syntax.combinator);
						
						return this.textContent
							.replace(dlmReg, Syntax.escapeChar + RegexSyntaxDelimiter.main)
							.replace(jntRegS, Syntax.escapeChar + Syntax.joint + Syntax.space)
							.replace(jntRegT, Syntax.escapeChar + Syntax.joint + Syntax.tab)
							.replace(cmbReg, Syntax.escapeChar + Syntax.combinator);
					}
					
					case TermEscapeKind.annotation:
					{
						const reg = new RegExp(Syntax.combinator);
						const rep = Syntax.escapeChar + Syntax.combinator;
						return this.textContent.replace(reg, rep);
					}
				}
			})();
			
			return val + (this.isList ? Syntax.list : "");
		}
	}
	
	/**
	 * An enumeration that describes the various ways
	 * to handle escaping when serializing a Term.
	 * This enumeration is used to address the differences
	 * in the way terms can be serialized, which can 
	 * depend on whether the term is a declaration or
	 * an annotation.
	 */
	export const enum TermEscapeKind
	{
		none = 0,
		declaration = 1,
		annotation = 2
	}
}
