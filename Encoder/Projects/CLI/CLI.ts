import { EncoderConfig, initializeCLI } from "../Core/CLI";

/**
 * Public CLI Manager for Unified Truth JSON Generator
 */
export default class JSONCLI 
{
	constructor(Config: EncoderConfig)
	{
		console.log(Config);	
	}
}

if(!module.parent) // only if this file is main module
	initializeCLI(JSONCLI);
