namespace Encoder 
{
	export class Prototype 
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
			
			let proto = new Prototype(
				code, 
				flags,
				new TypeSet(type.bases.map(FutureType.$)),
				new TypeSet(type.patterns.map(FutureType.$)),
				new TypeSet(type.parallels.map(FutureType.$)),
				new TypeSet(type.derivations.map(FutureType.$)),
				new TypeSet(type.contentsIntrinsic.map(FutureType.$))
			);
			
			const ex = code.prototypes.find(x => x.hash === proto.hash);
			
			if (ex) 
				proto = ex;
				
			return proto;
		}
		
		constructor(
			private code: Code,
			public flags: Backer.Bitfields,
			
			public bases = new TypeSet(),
			public patterns = new TypeSet(),
			public parallels = new TypeSet(),
			public derivations = new TypeSet(),
			public contentsIntrinsic = new TypeSet()) {}
			
		get id()
		{
			return this.code.prototypes.indexOf(this);
		}
		
		get hash()
		{
			return Backer.Util.hash(JSON.stringify(this));
		}
		
		toJSON()
		{	
			return Backer.Serializer.encode([
				this.flags, this.bases, this.patterns, this.parallels, this.derivations, this.contentsIntrinsic
			]);
		}		
	}
}