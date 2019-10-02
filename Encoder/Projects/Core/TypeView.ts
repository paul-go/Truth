import { Type } from "../../../Truth/Core/X"
import PrimeType from "./Type";
import { PrimeTypeSet } from "./TypeSet";

export default class TypeView
{
	static typeSetToArray(primes: PrimeTypeSet)
	{
		return Array.from(primes.values()).map(x => x.prime).filter(x => !!x) as PrimeType[];
	}
	
	constructor(private prime: PrimeType) { }
	
	/**
	 * Stores a text representation of the name of the type,
	 * or a serialized version of the pattern content in the
	 * case when the type is actually a pattern.
	 */
	get name()
	{
		return this.prime.name;
	}

	/**
	 * Stores a reference to the type, as it's defined in it's next most applicable type.
	 */
	get parallels(): readonly Type[]
	{
		throw new Error("Method not implemented.");
	}
	
	get parallelRoots(): readonly Type[]
	{
		throw new Error("Method not implemented.");
	}
	
	get container()
	{
		const prime = this.prime.container.prime;
		return prime ? prime.view : prime;	
	}
	
	/**
	 * Stores the array of types that are contained directly by this
	 * one. In the case when this type is a list type, this array does
	 * not include the list's intrinsic types.
	 */
	get contents()
	{
		return TypeView.typeSetToArray(this.prime.contents);
	}
	
	get contentsIntrinsic(): readonly any[]
	{
		throw new Error("Method not implemented.");
	}
	
	/**
	 * Stores the array of types from which this type extends.
	 * If this Type extends from a pattern, it is included in this
	 * array.
	 */
	get bases()
	{
		return TypeView.typeSetToArray(this.prime.bases);
	}
	get superordinates(): readonly any[]
	{
		throw new Error("Method not implemented.");
	}
	get subordinates(): readonly any[]
	{
		throw new Error("Method not implemented.");
	}
	get derivations()
	{
		return TypeView.typeSetToArray(this.prime.derivations);
	}
	get adjacents(): readonly Type[]
	{
		throw new Error("Method not implemented.");
	}
	get patterns()
	{
		return TypeView.typeSetToArray(this.prime.patterns);
	}
	
	/**
	 * Gets an array that contains the raw string values representing
	 * the type aliases with which this type has been annotated.
	 * 
	 * If this type is unspecified, the parallel graph is searched,
	 * and any applicable type aliases will be present in the returned
	 * array.
	 */
	get aliases(): readonly string[]
	{
		return this.prime.aliases;
	}
	get values(): readonly { value: string; base: Type; }[]
	{
		throw new Error("Method not implemented.");
	}
	get value(): string
	{
		throw new Error("Method not implemented.");
	}
	
	/**
	 *
	 */
	get isAnonymous()
	{
		return this.prime.flags.getFlag("isAnonymous");
	}
	
	/**
	 *
	 */
	get isFresh()
	{
		return this.prime.flags.getFlag("isFresh");
	}
	
	/**
	 *
	 */
	get isList()
	{
		return this.prime.flags.getFlag("isList");
	}
	
	/**
	 *
	 */
	get isListIntrinsic()
	{
		return this.prime.flags.getFlag("isListIntrinsic");
	}
	
	/**
	 *
	 */
	get isListExtrinsic()
	{
		return this.prime.flags.getFlag("isListExtrinsic");
	}
	
	/**
	 *
	 */
	get isPattern()
	{
		return this.prime.flags.getFlag("isPattern");
	}
	
	/**
	 *
	 */
	get isUri()
	{
		return this.prime.flags.getFlag("isUri");
	}
	
	/**
	 *
	 */
	get isSpecified()
	{
		return this.prime.flags.getFlag("isSpecified");
	}
	
	/**
	 *
	 */
	get isOverride() 
	{ 
		return this.prime.parallels.length > 0; 
	}
	
	/**
	 *
	 */
	get isIntroduction() 
	{ 
		return this.prime.parallels.length === 0; 
	}
	
	get isDirty(): boolean
	{
		return false;
	}
	
	visit(nextFn: (type: PrimeType) => PrimeType | Iterable<PrimeType>, reverse?: boolean): PrimeType[]
	{
		throw new Error("Method not implemented.");
	}
	iterate(nextFn: (type: PrimeType) => PrimeType | Iterable<PrimeType>, reverse?: boolean): Generator<{ type: PrimeType; via: PrimeType; }, void, undefined>
	{
		throw new Error("Method not implemented.");
	}
	query(...typePath: string[]): PrimeType
	{
		throw new Error("Method not implemented.");
	}
	is(baseType: PrimeType): boolean
	{
		throw new Error("Method not implemented.");
	}
	has(type: PrimeType): boolean
	{
		throw new Error("Method not implemented.");
	}

	
}