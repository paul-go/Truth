import { join, resolve } from "path";
import Scanner from "../Core/Scanner";

/**
 * truthconfig.js file interface
 * 
 * Todo: Solve circular referance problem
 */
export type EncoderRawConfig =
	[string, {
		[x: string]: {
			Code?: string,
			Exclude?: Array<string | RegExp>,
			Include?: Array<string | RegExp>
		}
	}];

export interface EncoderConfig
{
	Scanner: Scanner;
	
}

/**
 * Processes and links Raw Config
 */
export async function NormalizeConfig(raw: EncoderRawConfig): Promise<EncoderConfig>
{
	const Path = resolve(process.cwd(), raw[0]);
	const Document = await Scanner.FromFile(Path);
	return {
		Scanner: Document
	};
}

/**
* Initialize CLI
*	Config path's default is "truthconfig.js"
*/
export async function InitializeCLI(CLIType: {new (Config: EncoderConfig): any})
{
	if(!module.parent) // only if this file is main module
	{
		const configPath = process.argv[2] || join(process.cwd(), "./truthconfig.js");
		const config = require(configPath) as EncoderRawConfig;
		new CLIType(await NormalizeConfig(config));
	}
}