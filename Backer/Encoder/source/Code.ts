namespace Backer
{
	export class Code
	{
		types: Type[] = [];

		add(type: Type)
		{
			const id = this.types.push(type) - 1;
			return id;
		}
		
		toJSON() { return this.types; }
		valueOf() { return this.types.length; }
		[Symbol.toPrimitive]() { return this.types.length; }
		get [Symbol.toStringTag]() { return "Code"; }
	}
}