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
	DataPattern: RegExp;
} 

export interface EncoderConfig
{
	Code: CodeJSON;
	//Data: Record<string, any[]>;
	CodeFile: string;
}

/**
 * Processes and links Raw Config
 */
export async function normalizeConfig(raw: EncoderRawConfig): Promise<EncoderConfig>
{
	const Input = resolve(process.cwd(), raw.Input);
	const CodeFile = resolve(process.cwd(), raw.Declarations);
	
	const Code = new CodeJSON(raw.DataPattern);
	//await Code.loadFile(CodeFile);
	await Code.loadTruth(Input);
	/*
	const Data = {};
	for (const key in raw.Data)
		Data[key] = Code.extractData(key, raw.Data[key]);
	*/
	return {
		Code,
		//Data,
		CodeFile
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