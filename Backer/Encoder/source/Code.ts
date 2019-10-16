namespace Backer
{
	export class Code
	{
		types: Type[] = [];
		prototypes: Prototype[] = [];
		
		static Load(data: [PrototypeJSON[], TypeJSON[]])
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
			const dataType = data.map(x => {
				const type = new Type(
					this, 
					x[0][1], 
					this.prototypes[x[0][0]], 
					null,
					x[0][2]
				);
				
			});	
		}
		
		toJSON() { return this.types; }
		valueOf() { return this.types.length; }
		[Symbol.toPrimitive]() { return this.types.length; }
		get [Symbol.toStringTag]() { return "Code"; }
	}
}