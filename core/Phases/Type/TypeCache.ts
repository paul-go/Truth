
namespace Truth
{
	/**
	 * @internal
	 */
	export class TypeCache
	{
		/** */
		constructor(private readonly program: Program)
		{
			this.version = program.version;
		}
		
		/** */
		has(key: Phrase)
		{
			this.maybeClear();
			return this.phraseMap.has(key);
		}
		
		/** */
		get(phrase: Phrase)
		{
			this.maybeClear();
			
			if (this.phraseMap.has(phrase))
				return Not.undefined(this.phraseMap.get(phrase));
			
			const proxy = new TypeProxy(phrase);
			this.set(phrase, proxy);
			return proxy;
		}
		
		/** */
		lookup(termText: string)
		{
			return this.termMap.get(termText.toLowerCase()) || [];
		}
		
		/** */
		set(phrase: Phrase, type: TCachedType): TCachedType
		{
			this.maybeClear();
			this.phraseMap.set(phrase, type);
			
			if (type instanceof Type)
				this.termMap.add(phrase.terminal.toString().toLowerCase(), type);
			
			return type;
		}
		
		/** */
		private maybeClear()
		{
			if (this.program.version.newerThan(this.version))
			{
				this.phraseMap.clear();
				this.termMap.clear();
				this.version = this.program.version;
			}
		}
		
		/** */
		private version: VersionStamp;
		
		/** */
		private readonly phraseMap = new Map<Phrase, TCachedType>();
		
		/** */
		private readonly termMap = new MultiMap<string, Type>();
	}
	
	/**
	 * @internal
	 */
	export type TCachedType = Type | TypeProxy | null;
}
