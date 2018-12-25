import * as X from "../../X";

/**
 * A class that represents a portion of the content 
 * within an Infix that spans a type reference.
 */
export class Infix
{
	constructor(
		/** 
		 * Stores an array of strings that represent the
		 * terms located before the Joint operator.
		 */
		readonly lhsInfixSpans: InfixBounds,
		
		/**
		 * Stores an array of strings that represent the
		 * terms located after the Joint operator.
		 */
		readonly rhsInfixSpans: InfixBounds,
		
		/** */
		readonly flags: InfixFlags)
	{ }
	
	/** */
	toString()
	{
		const isPattern = (this.flags & InfixFlags.pattern) === InfixFlags.pattern;
		const isPortability = (this.flags & InfixFlags.portability) === InfixFlags.portability;
		const isNominal = (this.flags & InfixFlags.nominal) === InfixFlags.nominal;
		
		const delimL =
			isPattern ? X.InfixSyntax.patternStart :
			isNominal ? X.InfixSyntax.nominalStart :
			isPortability ? X.InfixSyntax.start + X.Syntax.space + X.Syntax.joint + X.Syntax.space :
			X.InfixSyntax.start;
		
		const delimR = 
			isPattern ? X.InfixSyntax.patternEnd :
			isNominal ? X.InfixSyntax.nominalEnd :
			X.InfixSyntax.end;
		
		const join = (spans: InfixBounds) =>
			Array.from(spans.values())
				.map(s => s.toString())
				.join(X.Syntax.combinator + X.Syntax.space);
		
		if (isPortability)
			return join(this.rhsInfixSpans);
		
		if (isPattern)
			return join(this.lhsInfixSpans);
		
		const joint = this.rhsInfixSpans.size > 0 ?
			X.Syntax.space + X.Syntax.joint + X.Syntax.space :
			"";
		
		return delimL + join(this.lhsInfixSpans) + joint + join(this.rhsInfixSpans) + delimR;
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


/**
 * Stores the locations of the subjects in an Infix, 
 * using coordinates relative to the containing
 * statement.
 */
export type InfixBounds = ReadonlyMap<number, X.Identifier>;