namespace Backer
{
	export const Schema: Record<string, any> = {};
	
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
			{
				const id = code.types.push(type) - 1;
				FutureType.IdMap.set(id, type);
			}
			
			for (const type of types)
				if (!type.container)
					Schema[type.name] = PLA(type);
			
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
				
				const generate = (content: Type) => 
				{
					const clone = new Type(
						this,
						content.name,
						content.prototype,
						FutureType.$(type),
						content.aliases.concat(<string[]>info.shift())
					);
					this.types.push(clone);
					
					for (const contentType of content.contents)
						generate(contentType);
				};
				
				this.types.push(type);
				
				const bases = prototype.bases.toArray().map(x => x.type);
				for (const base of bases)
					if (base)
					{
						type.aliases.push(...base.aliases);
						for (const content of base.contents)
							generate(content);
					}
				
				DataGraph[type.name] = PLA(type);
			}
		}
		
		toJSON() { return this.types; }
		valueOf() { return this.types.length; }
		[Symbol.toPrimitive]() { return this.types.length; }
		get [Symbol.toStringTag]() { return "Code"; }
	}
}