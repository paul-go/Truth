import * as X from "../X";


/**
 * @internal
 * */
export type HookTypeConstructor = new (router: X.HookRouter, agent: X.Agent | null) => HookType;


/**
 * 
 */
export abstract class HookType<TIn extends object | void = object, TOut extends object | void = void>
{
	/**
	 * @internal
	 * HookType objects are not instantiated using conventional means.
	 * They're created as a whole by the HookRouter when it "instantiates"
	 * the HookTypes namespace.
	 */
	constructor(
		private readonly router: X.HookRouter,
		private readonly agent: X.Agent | null = null)
	{ }
	
	/** 
	 * Adds a hook contributor function that executes in 
	 * response to the running of hooks of the containing type.
	 */
	contribute(fn: (hookIn: Readonly<TIn>) => TOut)
	{
		this.router.addContributor(this, this.agent, fn);
	}
	
	/**
	 * Adds a hook capturer function that runs after the hook contributors
	 * have returned their results. Hook capturer functions are passed an
	 * array containing the produced results of all the contributor functions.
	 */
	capture(fn: (hookIn: Readonly<TIn>) => void)
	{
		this.router.addCapturer(this, this.agent, fn);
	}
	
	/**
	 * Runs all hook contributor functions whose constructor matches the
	 * containing hook type. Then, all matching hook capturer functions are
	 * called, passing the return values generated by the contributor functions.
	 * @param hook An instance of the Hook to run.
	 */
	run(hookIn: TIn): TOut[]
	{
		return this.router.run(hookIn, this);
	}
}
