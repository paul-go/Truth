
namespace Truth
{
	/**
	 * Stores information about a character location in a document.
	 */
	export class ProgramInspection
	{
		constructor(
			/**
			 * Stores the 1-based line number at which the inspection began.
			 */
			readonly line: number,
			
			/**
			 * Stores the 1-based column number at which the inspection began.
			 */
			readonly column: number,
			
			/**
			 * Stores the statement object that was found at the inspected location.
			 */
			readonly statement: Statement,
			
			/**
			 * Stores the span object that was found at the inspected location, if any.
			 */
			readonly span: Span | null,
			
			/**
			 * Stores a value that indicates the general area of the statement
			 * in which the inspected location resides.
			 */
			readonly area: InspectedArea,
			
			/**
			 * Stores a value that indicates the kind of syntax that was
			 * discovered at the inspected location.
			 */
			readonly syntax: InspectedSyntax)
		{ }
		
		/**
		 * Gets an array of Type objects that would be the containers
		 * of any additional types that were to be entered at the inspected
		 * location. The array is empty in all cases other than when the
		 * inspected location is indented, and within a whitespace line.
		 * The following example demonstrates a case where this property
		 * would contain an array containing two Types:
		 * ```
		 * Container1, Container2
		 * 	| <-- Inspected position is here
		 * ```
		 */
		get theoreticalContainers(): readonly Type[]
		{
			if (this._theoreticalContainers)
				return this._theoreticalContainers;
			
			if (this.statement.isWhitespace)
			{
				const doc = this.statement.document;
				const offset = this.column - 1;
				const parent = doc.getParentFromPosition(this.line, offset);
				
				if (parent instanceof Statement)
					return this._theoreticalContainers = parent.declarations
						.flatMap(decl => Phrase.fromSpan(decl))
						.map(phrase => Type.construct(phrase))
						.filter((type): type is Type => !!type);
			}
			
			return this._theoreticalContainers = [];
		}
		private _theoreticalContainers: readonly Type[] | null = null;
		
		/**
		 * Gets an array of Types that are defined on the left side of
		 * the inspected statement.
		 * 
		 * In the case when the inspected area is the declaration side
		 * of the statement, the returned array will contain the Types
		 * that correspond to one specific declaration term. Note that
		 * this can generate multiple types in the case when the term
		 * being inspected is inside a multi-declaration container.
		 * 
		 * In the case when the inspected area is the annotation side
		 * of the statement, the returned array contains all Types that
		 * correspond to all declarations on the declaration side of the
		 * statement. In the vast majority of cases, this will still be a
		 * single-item array.
		 * 
		 * This property is guaranteed to never return an empty array.
		 * A null value is returned in such cases.
		 * 
		 * Gets a null value in the case when the inspected area is a
		 * whitespace or comment line.
		 */
		get types(): readonly Type[] | null
		{
			if (this._types !== undefined)
				return this._types;
			
			if (this.area === InspectedArea.declaration)
			{
				const types = Phrase.fromSpan(Not.null(this.span))
					.map(phrase => Type.construct(phrase))
					.filter((type): type is Type => !!type);
				
				// Don't bother returning an empty array, this will
				// just create one more thing that the API consumer
				// will need to check for.
				return this._types = types.length > 0 ? types : null;
			}
			else if (this.area === InspectedArea.annotation)
			{
				const types = this.statement.declarations
					.flatMap(decl => Phrase.fromSpan(decl))
					.map(phrase => Type.construct(phrase))
					.filter((type): type is Type => !!type);
				
				return this._types = types.length > 0 ? types : null;
			}
			
			return this._types = null;
		}
		private _types: readonly Type[] | null | undefined;
		
		/**
		 * 
		 */
		get keyword(): Keyword | null
		{
			if (this._keyword !== undefined)
				return this._keyword;
			
			while (this.area === InspectedArea.annotation)
			{
				const offset = this.column - 1;
				const anno = this.statement.getAnnotation(offset);
				
				// Return null in the case when the inspected area is in the 
				// annotation side, but there is no actual annotation present.
				// This can happen when the statement looks like "Type : "
				if (!anno)
					break;
				
				// We can safely construct phrases from the first declaration,
				// because all phrases returned in this case are going to allow
				// us to arrive at the relevant annotation.
				const phrases = Phrase.fromSpan(this.statement.declarations[0]);
				if (phrases.length > 0)
				{
					// We can safely construct a Type from the first phrase, because
					// we don't actually care about any of the phrases in this case,
					// but rather, a particular annotation which will be associated
					// with any of the returned phrases.
					const type = Not.null(Type.construct(phrases[0]));
					const annoText = anno.boundary.subject.toString();
					
					const keyword = type.keywords
						.find(key => key.word === annoText);
					
					// We won't be able to find a keyword in the case when
					// the thing that was hit has a fault on it. In this case, we
					// just return a string containing the hit content.
					if (!keyword)
						break;
					
					if (keyword)
						return this._keyword = keyword;
				}
				
				break;
			}
			
			return this._keyword = null;
		}
		private _keyword: Keyword | null | undefined;
	}
	
	/**
	 * An enumeration that represents the areas of a statement
	 * that are significantly differentiated for inspection purposes.
	 */
	export const enum InspectedArea
	{
		/**
		 * Indicates that the inspected area is within a no-op statement,
		 * within the indent area of a non-no-op statement.
		 */
		void,
		
		/**
		 * Indicates that the inspected area is on the declaration (left)
		 * side of a joint (or is in a non-no-op statement without a joint).
		 */
		declaration,
		
		/**
		 * Indicates that the inspected area is on the annotation (right)
		 * side of a joint. 
		 */
		annotation
	}
	
	/**
	 * An enumeration that indicates a kind of syntax that may be
	 * discovered at an inspected location.
	 */
	export const enum InspectedSyntax
	{
		void,
		term,
		combinator,
		joint
	}
}
