
namespace Truth
{
	/**
	 * Stores information about a character location in a document.
	 */
	export class ProgramInspectionResult
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
		 * would contain an array containing two types:
		 * ```
		 * Container1, Container2
		 * 	| <-- Inspected position is here
		 * ```
		 */
		get containers(): readonly Type[]
		{
			if (this._containers)
				return this._containers;
			
			if (this.statement.isWhitespace)
			{
				const doc = this.statement.document;
				const offset = this.column - 1;
				const parent = doc.getParentFromPosition(this.line, offset);
				
				if (parent instanceof Statement)
					return this._containers = parent.declarations
						.flatMap(decl => Phrase.fromSpan(decl))
						.map(phrase => Type.construct(phrase))
						.filter((type): type is Type => !!type);
			}
			
			return this._containers = [];
		}
		private _containers: readonly Type[] | null = null;
		
		/**
		 * Gets an array of types that are defined as declarations in the
		 * statement that contains the inspected location.
		 */
		get declarations()
		{
			if (this._declarations)
				return this._declarations;
			
			return this._declarations = this.statement.declarations
				.flatMap(decl => Phrase.fromSpan(decl))
				.map(phrase => Type.construct(phrase))
				.filter((type): type is Type => !!type);
		}
		private _declarations: readonly Type[] | null = null;
		
		/**
		 * Gets an array of types in the case when the inspected location
		 * is on the declaration side of a statement, or a keyword in the case
		 * when the inspected location is on the annotation side of the
		 * statement.
		 */
		get hit(): Keyword | readonly Type[] | string
		{
			if (this._hit !== null)
				return this._hit;
			
			if (this.area === InspectedArea.declaration)
			{
				const span = Not.null(this.span);
				return this._hit = Phrase.fromSpan(span)
					.map(ph => Type.construct(ph))
					.filter((type): type is Type => !!type);
			}
			else if (this.area === InspectedArea.annotation)
			{
				const offset = this.column - 1;
				const anno = this.statement.getAnnotation(offset);
				
				// Return an empty string in the case when the inspected area
				// is in the annotation side, but there is no actual annotation present.
				// This can happen when the statement looks like "Type : "
				if (!anno)
					return this._hit = "";
				
				// We can safely construct phrases from the first declaration,
				// because all phrases returned in this case are going to allow
				// us to arrive at the relevant annotation.
				const phrases = Phrase.fromSpan(this.statement.declarations[0]);
				if (phrases.length > 0)
				{
					// We can safely construct a type from the first phrase, because
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
						return this._hit = annoText;
					
					if (keyword)
						return this._hit = keyword;
				}
			}
			
			return this._hit = [];
		}
		private _hit: Keyword | readonly Type[] | string | null = null;
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
