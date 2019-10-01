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
		this.save();
	}
	
	formattJSON(Obj: any)
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
		writeFileSync(this.Config.CodeFile, this.formattJSON(this.Config.Code));
		console.info(`Truth Code JSON file ${this.Config.CodeFile} saved!`);
	}
}

if(!module.parent) // only if this file is main module
	initializeCLI(JSONCLI);
