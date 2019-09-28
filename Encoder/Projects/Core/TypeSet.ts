import { TypeId } from "./Type";
import CodeJSON from "./Code";

export class PrimeTypeSet extends Set<TypeId>
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
	
	constructor(private code: CodeJSON) 
	{
		super();
	}
	
	toString()
	{
		return this.signature;
	}
	
	toJSON()
	{
		return Array.from(this.values()).map(x => this.code.resolve(x)).sort();
	}
}