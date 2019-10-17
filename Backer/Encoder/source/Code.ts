namespace Backer
{
	export class Code
	{
		types: Type[] = [];
		prototypes: Prototype[] = [];
		
		static load(data: [PrototypeJSON[], TypeJSON[]])
		{
			const code = new Code();
			
			const prototypes = data[0].map(x => Prototype.fromJSON(code, x));
			for (const proto of prototypes)
				code.prototypes.push(proto);
				
			const types = data[1].map(x => Type.fromJSON(code, x));
			for (const type of types)
				code.types.push(type);
			
			return code;
		}
		
		loadData(data: DataJSON[])
		{	
			for (const info of data)
			{
				const typeData = info.shift() as [number, string, string[]];
				const prototype = this.prototypes[typeData[0]];
				const type = new Type(
					this, 
					typeData[1], 
					prototype, 
					null,
					typeData[2]
				);
				
				
				
				this.types.push(type);
			}
			
		}
		
		toJSON() { return this.types; }
		valueOf() { return this.types.length; }
		[Symbol.toPrimitive]() { return this.types.length; }
		get [Symbol.toStringTag]() { return "Code"; }
	}
}