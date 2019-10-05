import { EncoderConfig, initializeCLI } from "../Core/CLI";
import { writeFileSync } from "fs";
import { open } from "inspector";
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
			maxArrayLength: null,
			depth: null
		});
		return json.replace(/"/g, "\\\"").replace(/'/g, '"').replace(/  /g, "\t");
	}
	
	save()
	{
		writeFileSync(this.Config.CodeFile, this.formattJSON(this.Config.Code));
		/*for (const key in this.Config.Data)
			writeFileSync(`${key}.data.json`, this.formattJSON(this.Config.Data[key]));*/
		console.info(`Truth Code JSON file ${this.Config.CodeFile} saved!`);
	}
}


open(9229, "0.0.0.0", true);

if(!module.parent) // only if this file is main module
	initializeCLI(JSONCLI);
