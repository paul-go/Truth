import * as X from "../X";


/**
 * @internal
 * Stores all of the hook functions attached by all agents
 * in an internal database. Also deals with the invokation
 * of contributors and capturers, and routing their outputs
 * to the correct locations. Only one HookRouter instance
 * should be created in the Truth namespace.
 */
export class HookRouter
{
	/**
	 * @internal
	 * Test-only field used to disable running of hook functions.
	 */
	static disabled?: boolean;
	
	/**
	 * @internal
	 * Test-only field that is used to enable the logging, useful for debugging.
	 */
	static enableLogging?: boolean;
	
	/** @internal */
	constructor()
	{
	}
	
	/** Worker method for Hook.contribute(). */
	addContributor(
		hook: X.HookType<any, any>,
		agent: X.Agent | null, 
		contributorFn: (hookIn: any) => any)
	{
		const record = new HookFunctionRecord(hook, agent, contributorFn, null);
		this.addFunction(hook, record);
	}
	
	/** Worker method for Hook.capture(). */
	addCapturer(
		hook: X.HookType<any, any>, 
		agent: X.Agent | null, 
		capturerFn: (hookIn: any) => void)
	{
		const record = new HookFunctionRecord(hook, agent, null, capturerFn);
		this.addFunction(hook, record);
	}
	
	/** */
	private addFunction(hookType: X.HookType, record: HookFunctionRecord)
	{
		const type = <typeof X.HookType>hookType.constructor;
		
		if (this.map.has(type))
			this.map.get(type)!.push(record);
		else
			this.map.set(type, [record]);
	}
	
	/** Worker method for Hook.run(). */
	run<TIn extends object | void, TOut extends object | void>(
		hookIn: TIn, hookType: 
		X.HookType<any, any>): TOut[]
	{
		if (HookRouter.disabled)
			return [];
		
		const hookTypeCtor = <typeof X.HookType>hookType.constructor;
		const hookRecords = this.map.get(hookTypeCtor);
		
		if (!hookRecords || hookRecords.length === 0)
			return [];
		
		const clone = this.cloneHookDataObject(hookIn);
		const returns: any[] = [];
		
		// Run the contributor functions
		for (const record of hookRecords)
		{
			if (record.contributorFn)
			{
				const result = record.contributorFn(clone);
				if (result !== undefined)
					returns.push(result);
			}
		}
		
		// Run the capturer functions
		for (const record of hookRecords)
			if (record.capturerFn)
				record.capturerFn(clone, returns);
		
		return returns;
	}
	
	/** Creates a frozen clone of the specified object. */
	private cloneHookDataObject(hookIn: object | void)
	{
		if (hookIn === undefined)
			return undefined;
		
		const clone = {};
		
		for (const [key, value] of Object.entries(hookIn))
			Object.defineProperty(clone, key, { value, enumerable: true });
		
		return Object.freeze(clone);
	}
	
	/**
	 * @internal
	 * Removes all hooks that were added by the specified agent.
	 */
	removeAgentHooks(agent: X.Agent)
	{
		for (const [type, records] of this.map)
		{
			for (let i = records.length; --i;)
				if (records[i].agent === agent)
					records.splice(i, 1);
			
			if (records.length === 0)
				this.map.delete(type);
		}
	}
	
	/**
	 * @internal
	 * Central method for creating a HookTypesInstance (aka "Hooks").
	 */
	createHookTypesInstance(agent: X.Agent | null = null): HookTypesInstance
	{
		const hooks = <HookTypesInstance>{};
		
		for (const [hookName, hookClass] of Object.entries(X.HookTypes))
		{
			const ctor: X.HookTypeConstructor = <any>hookClass;
			const value = new ctor(this, agent);
			Object.defineProperty(hooks, hookName, { value, enumerable: true });
		}
		
		return Object.freeze(hooks);
	}
	
	/** Database of all attached hook functions. */
	private readonly map = new Map<typeof X.HookType, HookFunctionRecord[]>();
}


/** Defines an instantatiated version of the HookTypes namespace. */
export type HookTypesInstance = {
	[P in keyof typeof X.HookTypes]: Readonly<InstanceType<typeof X.HookTypes[P]>>
};


/**
 * HookRecord is a private class of HookRouter. 
 * HookRouter stores a database of these.
 */
class HookFunctionRecord
{
	constructor(
		readonly hook: X.HookType,
		readonly agent: X.Agent | null,
		readonly contributorFn: ((hookIn: any) => any) | null,
		readonly capturerFn: ((hookIn: any, returns: any[]) => void) | null)
	{ }
}


