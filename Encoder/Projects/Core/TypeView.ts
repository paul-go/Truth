import { Type } from "../../../Truth/Core/X"
import PrimeType from "./Type";

export default class TypeView
{
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
		return this.prime.container.prime.view;	
	}
	
	/**
	 * Stores the array of types that are contained directly by this
	 * one. In the case when this type is a list type, this array does
	 * not include the list's intrinsic types.
	 */
	get contents(): PrimeType[]
	{
		return Array.from(this.prime.contents.values()).map(x => x.prime);
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
	get bases(): readonly Type[]
	{
		throw new Error("Method not implemented.");
	}
	get superordinates(): readonly any[]
	{
		throw new Error("Method not implemented.");
	}
	get subordinates(): readonly any[]
	{
		throw new Error("Method not implemented.");
	}
	get derivations(): readonly any[]
	{
		throw new Error("Method not implemented.");
	}
	get adjacents(): readonly Type[]
	{
		throw new Error("Method not implemented.");
	}
	get patterns(): readonly Type[]
	{
		throw new Error("Method not implemented.");
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
		throw new Error("Method not implemented.");
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
	
	visit(nextFn: (type: Type) => Type | Iterable<Type>, reverse?: boolean): Type[]
	{
		throw new Error("Method not implemented.");
	}
	iterate(nextFn: (type: Type) => Type | Iterable<Type>, reverse?: boolean): Generator<{ type: Type; via: Type; }, void, undefined>
	{
		throw new Error("Method not implemented.");
	}
	query(...typePath: string[]): Type
	{
		throw new Error("Method not implemented.");
	}
	is(baseType: Type): boolean
	{
		throw new Error("Method not implemented.");
	}
	has(type: Type): boolean
	{
		throw new Error("Method not implemented.");
	}

	
}