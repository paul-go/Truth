import { EncoderConfig, initializeCLI } from "../Core/CLI";

/**
 * Public CLI Manager for Truth Data JSON Generator
 */
export default class JSONDataCLI 
{
	constructor(Config: EncoderConfig)
	{
		
	}
}

if(!module.parent) // only if this file is main module
	initializeCLI(JSONDataCLI);