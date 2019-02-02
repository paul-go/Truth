import * as X from "../X";

/**
 * @internal
 * A class that provides browser-style fetch functionality,
 * but with the ability to change this functions behavior
 * with a custom implementation.
 */
export class Fetch
{
	/**
	 * 
	 */
	static async exec(url: string)
	{
		const uri = X.Uri.tryParse(url);
		if (!uri)
			throw X.Exception.invalidUri(url);
		
		if (typeof fetch === "function")
		{
 			// TODO: Add better support for error handling here
			const response = await fetch(url);
			const responseText = await response.text();
			return responseText;
		}
		else if (typeof require === "function")
		{
			type HttpGet = typeof import("http").get;
			type HttpsGet = typeof import("https").get;
			type GetFn = HttpGet | HttpsGet;
			
			const getFn: GetFn = 
				uri.protocol === X.UriProtocol.https ? require("https").get :
				uri.protocol === X.UriProtocol.http ? require("http").get :
				null;
			
			if (getFn === null)
				throw X.Exception.invalidUri(url);
			
			debugger;
			"Not implemented";
			
			//const request = await getFn(url, response =>
			//{
			//	const data: string[] = [];
			//	
			//	response.on("data", chunk =>
			//	{
			//		data.push(typeof chunk === "string" ?
			//			chunk :
			//			chunk.toString("utf8"));
			//	});
			//	
			//	response.on("error", error =>
			//	{
			//		resolve(error);
			//	});
			//	
			//	response.on("end", () =>
			//	{
			//		resolve(data.join(""));
			//	});
			//});
			
			return "";
		}
		else throw X.Exception.unsupportedPlatform();
	}
}

declare function fetch(...args: any): any;
