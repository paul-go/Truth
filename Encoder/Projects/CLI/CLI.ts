import { EncoderConfig, initializeCLI } from "../Core/CLI";
import { writeFileSync } from "fs";
import Serializer from "../Core/Serializer";
import PrimeType from "../Core/Type";

/**
 * Public CLI Manager for Unified Truth JSON Generator
 */
export default class JSONCLI 
{
	constructor(public Config: EncoderConfig)
	{
		Config.Scanner.document.program.verify();
		const faults = Config.Scanner.document.program.faults;
		if (faults.count)
		{
			for (const fault of faults.each())
				console.error(fault.toString());
		}
		else
		{	
			this.save();
		}
	}
	
	save()
	{
		const json = JSON.stringify(this.Config.Code);
		writeFileSync(this.Config.Raw.Declarations, json);
		console.info(`Truth Code File: ${this.Config.Raw.Declarations} saved!`);
	}
}

if(!module.parent) // only if this file is main module
	initializeCLI(JSONCLI);
