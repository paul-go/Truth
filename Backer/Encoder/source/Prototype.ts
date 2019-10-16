
namespace Backer
{
	export type PrototypeJSON = [number, number, ...number[][]];
	
	export class Prototype 
	{
		static fromJSON(code: Code, serialized: PrototypeJSON)
		{
			const data = Serializer.decode(serialized, 6);
			
			return new Prototype(
				code, 
				new Bitfields(data[0]),
				TypeSet.fromJSON(data[1]),
				TypeSet.fromJSON(data[2]),
				TypeSet.fromJSON(data[3]),
				TypeSet.fromJSON(data[4]),
				TypeSet.fromJSON(data[5])
				);
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