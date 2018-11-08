import * as X from "../X";


/**
 * A class that defines a type defined within a scope.
 * A type may be composed of multiple pointers across
 * multiple localities, as represented by the .pointers
 * field.
 */
export class Type
{
	/**
	 * 
	 */
	constructor(pointers: ReadonlyArray<X.Pointer>)
	{
		if (pointers.length === 0)
			throw X.ExceptionMessage.invalidArgument();
		
		// Temp variables to suppress readonly errors.
		this.name = null!;
		this.parentType = this;
		this.fragments = pointers;
		this.bases = [];
		this.matchables = [];
	}
	
	/** */
	readonly name: X.Subject;
	
	/** */
	readonly parentType: Type;
	
	/** Stores an array of Types that base this one. */
	readonly bases: ReadonlyArray<Type>;
	
	/**
	 * Stores an array of annotations which failed to resolve as bases, 
	 * but were successfully resolved by regular expressions. The array is
	 * sorted in the order in which the annotations appear in the document.
	 */
	readonly matchables: ReadonlyArray<Match>;
	
	/** Stores an array of pointers to has-a side subjects that compose this Type. */
	readonly fragments: ReadonlyArray<X.Pointer>;
	
	/** */
	readonly isSpecified: boolean = false;
	
	/** */
	get isOverride() { return this.sources.length > 0; }
	
	/** */
	get isIntroduction() { return this.sources.length === 0; }
	
	/**
	 * The set of types that exist in supers that are equivalently
	 * named as the type that this TypeInfo object represents,
	 * that contribute to the construction of this type. If this
	 * Type is an introduction, the array is empty.
	 */
	readonly sources: ReadonlyArray<Type> = [];
	
	/** Gets the plurality status of the type. */
	get plurality()
	{
		return this._plurality !== null ? this._plurality : this._plurality = (() =>
		{
			return Plurality.none;
		})();
	}
	private _plurality: Plurality | null = null;
	
	/**
	 * Gets an array containing all child Types of this one, whether
	 * they're specified, unspecified, overriddes, or introductions.
	 */
	get childTypes()
	{
		return this._childTypes !== null ? this._childTypes : (() =>
		{
			return [];
		})();
	}
	private _childTypes: Type[] | null = null;
}


/**
 * Stores the plurality status of a Type.
 */
export enum Plurality
{
	/** Indicates that no plurality information is attached to the type. */
	none,
	
	/** Indicates that the type, or one of it's supers, has been pluralized. */
	pluralized,
	
	/** Indicates that the type has been singularized. */
	singularized,
	
	/** Indicates a conflict in the type's supers about the plurality status. */
	erroneous
}


/** */
export class Match
{
	constructor(
		readonly text: string,
		readonly bases: ReadonlyArray<Type>)
	{ }
}
