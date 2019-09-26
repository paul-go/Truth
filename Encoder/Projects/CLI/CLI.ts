import { EncoderConfig, initializeCLI } from "../Core/CLI";

/**
 * Public CLI Manager for Unified Truth JSON Generator
 */
export default class JSONCLI 
{
	constructor(Config: EncoderConfig)
	{
		console.log(JSON.stringify(Config.Code, undefined, 2));
	}
}

if(!module.parent) // only if this file is main module
	initializeCLI(JSONCLI);
