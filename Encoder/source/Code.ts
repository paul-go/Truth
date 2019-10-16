namespace Encoder
{
	export class Code
	{
		types: Type[] = [];
		prototypes: Prototype[] = [];
	
		add(type: Type)
		{
			if (!this.prototypes.some(x => x.hash === type.prototype.hash))
				this.prototypes.push(type.prototype);
				
			const id = this.types.push(type) - 1;
			type.transfer(this);
			return id;
		}
		
		link()
		{
			for (const type of this.types)
			{
				const container = type.container;
				if (container) 
				{
					const containerType = container.type;
					if (containerType)
						containerType.contents.add(FutureType.$(type));
				}
			}
		}
		
		extractData(pattern: RegExp)
		{
			const dataRoots = this.types.filter(x => x.container === null && pattern.test(x.name));
			
			const drill = (x: Type) =>
			{
				const array = [x];
				for (const content of x.contents)
				{
					const type = content.type;
					if (type)
					{
						const child = drill(type).flat();
						if (child.length)
							array.push(...child);
					}
				} 
				return array;
			};
			
			const dataSchema = dataRoots.map(drill).filter(x => Array.isArray(x) ? x.length : true);
			const dataQuery = dataSchema.flat();
			const codeRoots = this.types.filter(x => !dataQuery.includes(x));
			
			const code = new Code();
			for (const type of codeRoots)
				code.add(type);
				
			const dataRoot = (x: Type) => [x.prototype.id, x.name, x.aliases];
		
			const data = dataSchema.map(x => [dataRoot(x.shift()!), ...x.map(x => x.aliases)]);
				
			return {
				code,
				data
			}
		}
		
		toJSON() { return [this.prototypes, this.types]; }
		valueOf() { return this.types.length; }
		[Symbol.toPrimitive]() { return this.types.length; }
		get [Symbol.toStringTag]() { return "Code"; }
	}
}