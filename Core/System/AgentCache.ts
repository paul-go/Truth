import * as X from "../X";


/**
 * @internal
 * A cache that stores agent build function loaded by a single program instance.
 */
export class AgentCache
{
	/** */
	constructor(program: X.Program)
	{
		this.program = program;
		
		program.on(X.CauseUriReferenceAdd, data =>
		{
			if (data.uri.ext !== X.UriExtension.js)
				return;
			
			const uriText = data.uri.toStoreString();
			const existingCacheSet = this.cache.get(uriText);
			const reference = data.statement || this.program;
			
			if (existingCacheSet)
			{
				existingCacheSet.add(reference);
				return;
			}
			
			this.exec(data.uri).then(result =>
			{
				if (result instanceof Error)
				{
					"Need to deal with reporting agent load errors as faults here.";
					debugger;
					return;
				}
				
				this.program.cause(new X.CauseAgentAttach(data.uri));
				result();
				
				const set = new Set<X.Statement | X.Program>([reference]);
				this.cache.set(uriText, set);
			});
		});
		
		program.on(X.CauseUriReferenceRemove, data =>
		{
			if (data.uri.ext !== X.UriExtension.js)
				return;
			
			const uriText = data.uri.toStoreString();
			const existingCacheSet = this.cache.get(uriText);
			if (!existingCacheSet)
				return;
			
			existingCacheSet.delete(data.statement || this.program);
			if (existingCacheSet.size === 0)
			{
				this.cache.delete(uriText);
				this.program.cause(new X.CauseAgentDetach(data.uri));
			}
		});
	}
	
	/** */
	private readonly program: X.Program;
	
	/**
	 * Execute the code file containing the agent at the specified URI.
	 */
	private async exec(agentUri: X.Uri): Promise<(() => any) | Error>
	{
		const uri = X.Uri.maybeParse(agentUri);
		if (uri === null)
			return X.Exception.invalidUri();
		
		const uriText = uri.toStoreString();
		
		const agentSource = await X.UriReader.tryRead(uri);
		if (agentSource instanceof Error)
			return agentSource;
		
		try
		{
			const patchedProgram = X.Misc.patch(this.program,
			{
				instanceOwnerUri: uri
			});
			
			const ctor = new Function("program", "Truth", agentSource);
			return ctor.bind(Object.freeze({}), patchedProgram, X);
		}
		catch (e)
		{
			return new Error(e.message || "");
		}
	}
	
	/**
	 * Stores a map whose keys are agent URIs, and whose values
	 * are a set of Statement instances that reference the agent,
	 * or, in the case when the agent is added to the program
	 * through another means (such as programmatically),
	 * a reference to the program is stored instead.
	 * 
	 * Technically an agent should be attached in only one place
	 * in the program, however, this may not always be the case,
	 * and the system needs to be able to handle the case when
	 * it isn't.
	 * 
	 * This array is used to reference count / garbage collect
	 * the attached agents.
	 */
	private readonly cache = new Map<string, Set<X.Statement | X.Program>>();
}
