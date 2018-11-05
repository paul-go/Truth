import * as NodeFs from "fs";


/**
 * @internal
 * Exposes the "fs" module used by the compiler, 
 * as well as the ability to change the module used
 * with a custom implementation.
 */
export class Fs
{
	/**
	 * Assigns a new implementation of the node "fs" module.
	 */
	static override(module: typeof NodeFs)
	{
		this._module = module;
	}
	
	/** */
	static get module()
	{
		if (this._module)
			return this._module;
		
		this._module = require("fs");
		return this._module!;
	}
	
	/** */
	private static _module: typeof NodeFs | null = null;
}
