
namespace Encoder
{
	export class Type
	{
		static fromTruth(code: Code, type: Truth.Type)
		{
			const flags = new Backer.Bitfields();
			
			flags.set(0, type.isAnonymous);
			flags.set(1, type.isFresh);
			flags.set(2, type.isList);
			flags.set(3, type.isListIntrinsic);
			flags.set(4, type.isListExtrinsic);
			flags.set(5, type.isPattern);
			flags.set(6, type.isUri);
			flags.set(7, type.isSpecified);
			
			const instance = new this(
				code, 
				type.name,
				flags,
				type.container ? FutureType.$(type) : null,
				type.aliases as string[],
				new TypeSet(type.bases.map(FutureType.$)),
				new TypeSet(type.patterns.map(FutureType.$)),
				new TypeSet(type.parallels.map(FutureType.$)),
				new TypeSet(type.derivations.map(FutureType.$)),
				new TypeSet(type.contentsIntrinsic.map(FutureType.$))
			);
			
			FutureType.TypeMap.set(type, instance);
		}
		
		constructor(
			private code: Code,
			public name: string,
			public flags: Backer.Bitfields,
			public container: FutureType | null = null,
			
			public aliases: string[] = [],
			public bases = new TypeSet(),
			public patterns = new TypeSet(),
			public parallels = new TypeSet(),
			public derivations = new TypeSet(),
			public contentsIntrinsic = new TypeSet()) {}
		
		get id()
		{
			return this.code.types.indexOf(this);
		}
		
		toJSON()
		{	
			return Backer.Serializer.encode([
				this.name, this.flags, this.container, this.aliases
			]);
		}
	}
}