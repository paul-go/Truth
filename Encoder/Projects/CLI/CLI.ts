import { EncoderConfig, initializeCLI } from "../Core/CLI";
import { writeFileSync } from "fs";
import Serializer from "../Core/Serializer";

/**
 * Public CLI Manager for Unified Truth JSON Generator
 */
export default class JSONCLI 
{
	constructor(Config: EncoderConfig)
	{
		const json = JSON.stringify(Config.Code, undefined, 2);
		writeFileSync(Config.Raw.Declarations, json);
		const array = JSON.parse(json);
		console.log(array); // first output
		console.log(array.map((x: [number] & any[]) => Serializer.decode(x, 6))); // second output
	}
}

if(!module.parent) // only if this file is main module
	initializeCLI(JSONCLI);
