import { join, resolve } from "path";
import CodeJSON from "./Code";

export type RawDataPatternMap = {
	[x: string]: RegExp
};

/**
 * truthconfig.js file interface
 */
export interface EncoderRawConfig 
{
	Input: string;
	Declarations: string;
	Data: RawDataPatternMap;
} 

export interface EncoderConfig
{
	Code: CodeJSON;
	Raw: EncoderRawConfig;
}

/**
 * Processes and links Raw Config
 */
export async function normalizeConfig(raw: EncoderRawConfig): Promise<EncoderConfig>
{
	const Input = resolve(process.cwd(), raw.Input);
	const CodeFile = resolve(process.cwd(), raw.Declarations);
	
	const Code = new CodeJSON();
	await Code.loadFile(CodeFile);
	await Code.loadTruth(Input);
	
	return {
		Code,
		Raw: raw
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