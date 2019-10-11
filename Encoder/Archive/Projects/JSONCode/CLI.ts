import { EncoderConfig, initializeCLI } from "../Core/CLI";

/**
 * Public CLI Manager for Truth Code JSON Generator
 */
export default class JSONCodeCLI 
{
	constructor(Config: EncoderConfig)
	{
		
	}
}

if(!module.parent) // only if this file is main module
	initializeCLI(JSONCodeCLI);