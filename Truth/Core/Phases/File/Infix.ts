import * as X from "../../X";

/**
 * A class that represents a portion of the content 
 * within an Infix that spans a type reference.
 */
export class Infix
{
	constructor(
		/**
		 * Stores the left-most character position of the Infix
		 * (before the delimiter), relative to the containing statement.
		 */
		readonly offsetStart: number,
		
		/**
		 * Stores the left-most character position of the Infix
		 * (after the delimiter), relative to the containing statement.
		 */
		readonly offsetEnd: number,
		
		/** 
		 * Stores the Bounds object that marks out the positions
		 * of the identifiers in the Infix that are located before
		 * any Joint operator.
		 */
		readonly lhs: X.BoundaryGroup<X.Identifier>,
		
		/**
		 * Stores the Bounds object that marks out the positions
		 * of the identifiers in the Infix that are located after
		 * any Joint operator.
		 */
		readonly rhs: X.BoundaryGroup<X.Identifier>,
		
		/** */
		readonly flags: InfixFlags)
	{ }
	
	/**
	 * Gets whether this Infix is of the "pattern" variety.
	 */
	get isPattern()
	{
		return (this.flags & InfixFlags.pattern) === InfixFlags.pattern;
	}
	
	/**
	 * Gets whether this Infix is of the "portability" variety.
	 */
	get isPortability()
	{
		return (this.flags & InfixFlags.portability) === InfixFlags.portability;
	}
	
	/**
	 * Gets whether this Infix is of the "population" variety.
	 */
	get isPopulation()
	{
		return (this.flags & InfixFlags.population) === InfixFlags.population;
	}
	
	/**
	 * Gets whether this Infix has the "nominal" option set.
	 */
	get isNominal()
	{
		return (this.flags & InfixFlags.nominal) === InfixFlags.nominal;
	}
	
	/** */
	toString()
	{
		const delimL =
			this.isPattern ? X.InfixSyntax.patternStart :
			this.isNominal ? X.InfixSyntax.nominalStart :
			this.isPortability ? X.InfixSyntax.start + X.Syntax.space + X.Syntax.joint + X.Syntax.space :
			X.InfixSyntax.start;
		
		const delimR = 
			this.isPattern ? X.InfixSyntax.patternEnd :
			this.isNominal ? X.InfixSyntax.nominalEnd :
			X.InfixSyntax.end;
		
		const join = (spans: X.BoundaryGroup<X.Identifier>) =>
			Array.from(spans)
				.map(entry => entry.subject)
				.join(X.Syntax.combinator + X.Syntax.space);
		
		if (this.isPortability)
			return join(this.rhs);
		
		if (this.isPattern)
			return join(this.lhs);
		
		const joint = this.rhs.length > 0 ?
			X.Syntax.space + X.Syntax.joint + X.Syntax.space :
			"";
		
		return delimL + join(this.lhs) + joint + join(this.rhs) + delimR;
	}
}


/**
 * 
 */
export enum InfixFlags
{
	none = 0,
	/**
	 * Indicates that the joint was specified within
	 * the infix. Can be used to determine if the infix
	 * contains some (erroneous) syntax resembing
	 * a refresh type, eg - /<Type : >/
	 */
	hasJoint = 1,
	/**
	 * Indicates that the </Pattern/> syntax was
	 * used to embed the patterns associated
	 * with a specified type.
	 */
	pattern = 2,
	/**
	 * Indicates that the infix is of the "portabiity"
	 * variety, using the syntax < : Type>
	 */
	portability = 4,
	/**
	 * Indicates that the infix is of the "popuation"
	 * variety, using the syntax <Declaration : Annotation>
	 * or <Declaration>
	 */
	population = 8,
	/**
	 * Indicates that the <<Double>> angle bracket
	 * syntax was used to only match named types,
	 * rather than aliases.
	 */
	nominal = 16
}
