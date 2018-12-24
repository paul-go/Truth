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