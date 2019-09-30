import { EncoderConfig, initializeCLI } from "../Core/CLI";
import { writeFileSync } from "fs";
import { inspect } from "util";

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
	
	formattedJSON(Obj: any)
	{
		const data = JSON.parse(JSON.stringify(Obj));
		const json = inspect(data, {
			compact: true,
			breakLength: 100,
			maxArrayLength: null
		});
		return json.replace(/"/g, "\\\"").replace(/'/g, '"').replace(/  /g, "\t");
	}
	
	save()
	{
		writeFileSync(this.Config.Raw.Declarations, this.formattedJSON(this.Config.Code));
		console.info(`Truth Code File: ${this.Config.Raw.Declarations} saved!`);
	}
}

if(!module.parent) // only if this file is main module
	initializeCLI(JSONCLI);
