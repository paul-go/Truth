import { join, resolve } from "path";
import Scanner from "./Scanner";
import CodeJSON from "./Code";

export type RawDataPatternMap = {
	[x: string]: RegExp[]
};

/**
 * truthconfig.js file interface
 */
export interface EncoderRawConfig 
{
	Input: string,
	Declarations: string,
	Data: RawDataPatternMap
} 

export interface EncoderConfig
{
	Scanner: Scanner;
	Code: CodeJSON;
}

/**
 * Processes and links Raw Config
 */
export async function normalizeConfig(raw: EncoderRawConfig): Promise<EncoderConfig>
{
	const Input = resolve(process.cwd(), raw.Input);
	const CodeFile = resolve(process.cwd(), raw.Declarations);
	
	const Document = await Scanner.fromFile(Input, raw.Data);
	const Code = await CodeJSON.fromFile(CodeFile, Document);
	
	return {
		Code,
		Scanner: Document,
	};
}

/**
 * Initializes CLI with given consturctor 
 */
export async function initializeCLI(CLIType: {new (Config: EncoderConfig): any})
{
	const configPath = process.argv[2] || join(process.cwd(), "./truthconfig.js");
	const config = require(configPath) as EncoderRawConfig;
	new CLIType(await normalizeConfig(config));
}