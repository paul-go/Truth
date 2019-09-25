import Scanner from "../Core/Scanner";
/**
 * truthconfig.js file interface
 *
 * Todo: Solve circular referance problem
 */
export declare type EncoderRawConfig = [string, {
    [x: string]: {
        Code?: string;
        Exclude?: Array<string | RegExp>;
        Include?: Array<string | RegExp>;
    };
}];
export interface EncoderConfig {
    Scanner: Scanner;
}
/**
 * Processes and links Raw Config
 */
export declare function NormalizeConfig(raw: EncoderRawConfig): Promise<EncoderConfig>;
/**
* Initialize CLI
*	Config path's default is "truthconfig.js"
*/
export declare function InitializeCLI(CLIType: {
    new (Config: EncoderConfig): any;
}): Promise<void>;
