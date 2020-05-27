
namespace CoverTruth
{
	/** */
	export async function coverClassDeclarations()
	{
		/** */
		function render(impl: (text: string) => string): Truth.Trait<typeof render>
		{
			const trait = new Truth.Trait(render, impl);
			return trait as any;
		}
		
		class Maybe extends Truth.class()
		{
			
		}
		
		class Yes extends Truth.class()
		{
			is = Maybe;
		}
		
		class No extends Truth.class()
		{
			is = Maybe;
		}
		
		const program = new Truth.Program();
		
		// This is an example of how a custom trait class might
		// be defined in an included script file.
		
		const traits = [
			render(text =>
			{
				return "<" + text + ">";
			})
		];
		
		class Task extends Truth.class(...traits)
		{
			has = [Done, Description];
		}
		
		class Done extends Truth.class() { is = Maybe; }
		class Description extends Truth.class() { is = Maybe; }
		
		program.declare(Maybe, Yes, No, Task);
		
		const doc = await program.addDocument(
			`myTask : Task`
		);
		
		if (doc instanceof Error)
			return () => !"Unexpected error";
		
		if (!program.check())
			return () => !"Program did not check properly";
		
		const type = doc.query("myTask");
		if (!(type instanceof Truth.Type))
			return () => !"Type did not compile properly";
		
		const doneType = program.declassify(Task, Done);
		const result = type.call(render)?.("value");
		return () => result === "<value>";
	}
	
	/** */
	export async function coverDeclassify()
	{
		const program = new Truth.Program();
		class Potato extends Truth.class() { }
		program.declare(Potato);
		
		await program.addDocument();
		const hasNoFaults = program.check();
		const type = program.declassify(Potato);
		
		return [
			() => hasNoFaults,
			() => type instanceof Truth.Type,
			() => type.name === Potato.name
		];
	}
}
