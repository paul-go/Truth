
namespace Backer
{
	export type DataJSON = [[number, string, string[]], ...string[][]];
	export type TypeJSON = [number, number | null, string, string[]];
	
	export class Type 
	{
		static fromJSON(code: Code, data: TypeJSON)
		{
			return new Type(
				code, 
				data[2],
				code.prototypes[data[0]],
				data[1] ? FutureType.$(data[1]) : null,
				data[3]
			);
		}
		
		constructor(
			private code: Code,
			public name: string,
			public prototype: Prototype,
			public container: FutureType | null = null,
			
			public aliases: string[] = []) {}
			
		get id()
		{
			return this.code.types.indexOf(this);
		}
	}
}