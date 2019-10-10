
namespace Backer
{
	export class Type 
	{
		flags: Bitfields;
		
		constructor(
			private code: Code,
			public name: string,
			flags = 0,
			public container: FutureType | null = null,
			
			public aliases: string[] = [],
			public bases = new TypeSet(),
			public patterns = new TypeSet(),
			public parallels = new TypeSet(),
			public derivations = new TypeSet(),
			public contentsIntrinsic = new TypeSet(),
		) {
			this.flags = new Bitfields(flags);
		}
		
		get id()
		{
			return this.code.types.indexOf(this);
		}
		
		toJSON()
		{	
			return Serializer.encode([
				this.name, this.flags, this.container, this.aliases
			]);
		}
	}
}