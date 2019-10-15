
namespace Encoder
{
	export class Type
	{
		static fromTruth(code: Code, type: Truth.Type)
		{	
			const instance = new Type(
				code, 
				type.isPattern ? type.name.substr(9) : type.name, 
				Prototype.fromTruth(code, type),
				type.container ? FutureType.$(type) : null,
				type.aliases as string[]
			);
			
			FutureType.TypeMap.set(type, instance);
			return instance;
		}
		
		constructor(
			private code: Code,
			public name: string,
			public prototype: Prototype,
			public container: FutureType | null = null,
			
			public aliases: string[] = []) {}
			
		public contents = new TypeSet();
			
		get id()
		{
			return this.code.types.indexOf(this);
		}
		
		toJSON()
		{	
			return [this.prototype.id, this.container, this.name, this.aliases];
		}
	}
}