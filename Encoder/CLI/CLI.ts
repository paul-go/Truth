import { EncoderConfig, InitializeCLI } from "../Core/CLI";

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

InitializeCLI(JSONCLI);