
namespace Backer
{
	/**
	 * 
	 */
	export type PrototypeJSON = [number, number, ...number[][]];
	
	/**
	 * 
	 */
	export class Prototype 
	{
		/**
		 * Generate a Prototype from Truth.Type
		 */
		static new(code: Code, type: Truth.Type)
		{
			const flags = new Bitfields();
			
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
				new TypeSet(type.bases.map(FutureType.new)),
				new TypeSet(type.patterns.map(FutureType.new)),
				new TypeSet(type.parallels.map(FutureType.new)),
				new TypeSet(type.contentsIntrinsic.map(FutureType.new))
			);
			
			const ex = code.prototypes.find(proto => proto.hash === proto.hash);
			if (ex)
				proto = ex;
			
			return proto;
		}
	
		/**
		 * Load Prototype from CodeJSON
		 */
		static load(code: Code, serialized: PrototypeJSON)
		{
			const data = Util.decode(serialized, 5);
			
			return new Prototype(
				code, 
				new Bitfields(data[0]),
				TypeSet.fromJSON(data[1]),
				TypeSet.fromJSON(data[2]),
				TypeSet.fromJSON(data[3]),
				TypeSet.fromJSON(data[4])
			);
		}
		
		/** */
		constructor(
			private code: Code,
			readonly flags: Bitfields,
			readonly bases = new TypeSet(),
			readonly patterns = new TypeSet(),
			readonly parallels = new TypeSet(),
			readonly contentsIntrinsic = new TypeSet())
		{}
		
		/** */
		get id()
		{
			return this.code.prototypes.indexOf(this);
		}
		
		/** */
		get hash()
		{
			return Util.hash(JSON.stringify(this));
		}
		
		/**
		 * Transfer ownership of this instance to another Code instance
		 */
		transfer(code: Code)
		{
			this.code = code;
		}
		
		/** */
		toJSON()
		{	
			return Util.encode([
				this.flags,
				this.bases,
				this.patterns,
				this.parallels,
				this.contentsIntrinsic
			]);
		}
	}
}
