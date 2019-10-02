import { FuturePrimeType } from "./FutureType";

export class PrimeTypeSet extends Set<FuturePrimeType>
{
	get signature()
	{
		const json = this.toJSON();
		return json.join(',');
	}
	
	get length()
	{
		return this.size;
	}
	
	toString()
	{
		return this.signature;
	}
	
	toJSON()
	{
		return Array.from(this.values()).sort();
	}
}