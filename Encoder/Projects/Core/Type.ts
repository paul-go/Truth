import { Type } from "../../../Truth/Core/X";
import CodeJSON from "./Code";
import Flags from "./Flags";
import { typeHash, HashHash, JSONHash } from "./Util";
import { PrimeTypeSet } from "./TypeSet";
import Serializer from "./Serializer";
import { FuturePrimeType } from "./FutureType";
import PrimeTypeView from "./TypeView";

//Self explaining types
export type TypeId = number;
export type Alias = string;

export type Typeish = TypeId | PrimeType | Type;

export type ExtractKeys<T, Q> = {
  [P in keyof T]: T[P] extends Q  ? P : never
}[keyof T]; 

/**
 * Lazy and serializable representation of Type 
 */
export default class PrimeType 
{	
	static FlagFields: ExtractKeys<Type, boolean>[] = [
		"isAnonymous", 
		"isFresh",
		"isList",
		"isListIntrinsic",
		"isListExtrinsic",
		"isPattern",
		"isUri", 
		"isSpecified",
	];
	
	static TypeSetFields: ExtractKeys<Type, readonly Type[]>[] = [
		"bases",
		"parallels",
		"patterns",
		"contentsIntrinsic",
	];
	
	static JSONLength = 5 + PrimeType.TypeSetFields.length;
	static SignatureMap = new Map<number, PrimeType>();
	static Views = new Map<PrimeType, PrimeTypeView>();
	
	static View(prime: PrimeType)
	{
		if (this.Views.has(prime))
			return this.Views.get(prime);
		
		const view = new PrimeTypeView(prime);
		this.Views.set(prime, view);
		return view;
	}
	
	/**
	 *
	 */
	static fromType(code: CodeJSON, type: Type)
	{
		const sign = typeHash(type);
		
		if (this.SignatureMap.has(sign))
		{
			const prime = this.SignatureMap.get(sign);
			FuturePrimeType.set(type, prime);
			return prime;
		}
	
		const prime = new PrimeType(code);
		FuturePrimeType.set(type, prime);
		
		prime.name = type.name;
		prime.typeSignature = typeHash(type);
		
		PrimeType.SignatureMap.set(prime.typeSignature, prime);
		prime.container = FuturePrimeType.$(type.container);
		
		for (const key of PrimeType.FlagFields)
			prime.flags.setFlag(key, type[key]);
			
		for (const key of PrimeType.TypeSetFields)
			for (const subtype of type[key])
				(<PrimeTypeSet>prime[key]).add(FuturePrimeType.$(subtype));
				 
		for (const alias of type.aliases)
			prime.aliases.push(alias);
			 
		return prime;
	}
	
	/**
	 *
	 */
	static fromJSON(code: CodeJSON, data: [
		number, string, number, number, 
		Alias[], TypeId[], TypeId[], TypeId[], TypeId[]
	])
	{ 
		const prime = new PrimeType(code);
		prime.typeSignature = data[0];
		prime.name = data[1];	
		prime.flags.flags = data[2];
		prime.container = FuturePrimeType.$(data[3]);
		data[4].forEach(x => prime.aliases.push(x));
		data[5].forEach(x => prime.bases.add(FuturePrimeType.$(x)));
		data[6].forEach(x => prime.parallels.add(FuturePrimeType.$(x)));
		data[7].forEach(x => prime.patterns.add(FuturePrimeType.$(x)));
		data[8].forEach(x => prime.contentsIntrinsic.add(FuturePrimeType.$(x)));
		this.SignatureMap.set(data[0], prime);
		return prime;
	}
	
	static fromData(code: CodeJSON, data: string[])
	{
		const name = data.shift();
		const bases = data.shift();
		console.log(name);
	}
	
	flags = new Flags(PrimeType.FlagFields);
	
	name: string = "";
	
	typeSignature = 0;
	
	aliases: string[] = [];
	container: FuturePrimeType;
	bases = new PrimeTypeSet();
	contents = new PrimeTypeSet();
	patterns = new PrimeTypeSet();
	parallels = new PrimeTypeSet();
	derivations = new PrimeTypeSet();
	contentsIntrinsic = new PrimeTypeSet();
	
	/**
	 *
	 */
	constructor(protected code: CodeJSON) {	}
	
	/**
	 * Index of prime type in Code JSON
	 */
	get id()
	{
		return this.code.primeId(this);
	}
	
	get view()
	{
		return PrimeType.View(this);
	}
	
	get data()
	{
		const array: Array<string | TypeId[]> = [this.name];
		array.push(this.bases.toJSON().map(x => x.id));
		
		const scan = (prime: PrimeType) => {
			prime.aliases.forEach(x => array.push(x));
			prime.contents.forEach(x => scan(x.prime));
		}
		
		scan(this);
		return array;
	}
	
	link()
	{
		const container = this.container.prime;
		if(container)
			container.contents.add(FuturePrimeType.$(this));
	}
	
	compile(name: string)
	{
		const prime = new PrimeType(this.code);
		prime.typeSignature = JSONHash(this.parallels, this.bases);
		prime.name = name;	
		prime.flags.flags = this.flags.flags;
		prime.container = this.container;
		this.aliases.forEach(x => prime.aliases.push(x));
		this.bases.forEach(x => prime.bases.add(x));
		this.parallels.forEach(x => prime.parallels.add(x));
		this.patterns.forEach(x => prime.patterns.add(x));
		this.contentsIntrinsic.forEach(x => prime.contentsIntrinsic.add(x));
		return prime;
	}
	
	/**
	 * 
	 */
	toJSON()
	{	
		return Serializer.encode([
			this.typeSignature, this.name, this.flags, this.container, this.aliases,
			...PrimeType.TypeSetFields.map(x => this[x])
		]);
	}
}
