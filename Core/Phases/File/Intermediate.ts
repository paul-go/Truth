import * as X from "../../X";


//
// This file contains the classes that form the structure of the 
// intermediate representation that sits between the File Phase
// and the Analysis Phase of the compiler.
//


/**
 * A Strand is essentially an inspectable version of a URI's type
 * path. More specifically, it is a type that describes a series of 
 * objects of the abstract Subject type, that aligns with the
 * components of a type URI (the ordering of the entry in the
 * map is relevant).
 * 
 * Each Subject key is related to a set of Span objects that
 * represent the points of the document that where discovered
 * in relation to each component of the type URI.
 */
export class Strand
{
	/** */
	constructor(readonly molecules: ReadonlyArray<Molecule>)
	{
		if (molecules.length === 0)
			throw X.ExceptionMessage.invalidArgument();
	}
	
	/**
	 * Creates a string representation of this Strand that 
	 * allows it's contents to be compared with other 
	 * Strand objects with equivalent contents. An example
	 * of the string format is as follows:
	 * 
	 * 	file://path/to/document.truth
	 * LocalAtom1
	 * 	ReferencedAtom1
	 * 	ReferencedAtom2
	 * LocalAtom2
	 * 	ReferencedAtom3
	 * 	ReferencedAtom4
	 * 
	 * Future work may include determining whether returning
	 * this string as an MD5 hash will result in a reduction of
	 * memory usage.
	 */
	toString()
	{
		const parts: string[] = [];
		
		parts.push(X.Syntax.tab + this.molecules[0]
			.localAtom.spans[0].statement
			.document.sourceUri.toString(true, true));
		
		for (const mol of this.molecules)
		{
			parts.push(mol.localAtom.subject.toString());
			parts.push(...mol.referencedAtoms.map(at =>
				X.Syntax.tab + at.subject.toString()));
		}
		
		return parts.join(X.Syntax.terminal);
	}
	
	/**
	 * Clones this Strand into a new object, but with the
	 * specified number of molecules trimmed from the end.
	 */
	retract(depth: number)
	{
		if (depth < 1)
			throw X.ExceptionMessage.invalidArgument();
		
		if (depth >= this.molecules.length)
			throw X.ExceptionMessage.invalidArgument();
		
		return new Strand(this.molecules.slice(0, -depth));
	}
}


/**
 * 
 */
export class Molecule
{
	constructor(
		readonly localAtom: Atom,
		readonly referencedAtoms: ReadonlyArray<Atom>)
	{ }
}


/**
 * A class that stores the Span objects that represent the
 * instances of a particular subject within a single type
 * locality. For example, an Atom would store all Spans
 * that correspond to the occurences of "X" in the
 * following document:
 * 
 * Y, Z
 * A
 *     B
 *     X, X : Y
 * A
 *     X : Z
 */
export class Atom
{
	constructor(
		readonly subject: X.Subject,
		readonly spans: ReadonlyArray<X.Span>)
	{
		if (spans.length === 0)
			throw X.ExceptionMessage.invalidArgument();
	}
}
