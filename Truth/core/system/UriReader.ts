
namespace Truth
{
	/**
	 * An interface for an object that provides URI-reading functionality.
	 */
	export interface IUriReader
	{
		/**
		 * Attempts to read the contents of the given URI.
		 * If an error is generated while trying to read a file 
		 * at the specified location, the errors is returned.
		 */
		tryRead(uri: KnownUri): Promise<string | Error>;
	}
	
	/** @internal */
	export function createDefaultUriReader(): IUriReader
	{
		return {
			tryRead: async (uri: KnownUri) =>
			{
				const uriText = uri.toString();
				
				if (uri.protocol === UriProtocol.file)
					return await readFileUri(uriText);
				
				else if (uri.protocol === UriProtocol.http ||
					uri.protocol === UriProtocol.https)
					return await readWebUri(uriText);
				
				throw Exception.notImplemented();
			}
		};
	}
	
	/**
	 * 
	 */
	async function readFileUri(path: string, opts = "utf8")
	{
		return new Promise<string | Error>(resolve =>
		{
			Fs.module.readFile(path, opts, (error, data) =>
			{
				resolve(error && error.errno ?
					error :
					data || "");
			});
		});
	}
	
	/**
	 * Provides browser-style fetch functionality.
	 */
	async function readWebUri(url: string): Promise<string | Error>
	{
		if (typeof fetch === "function")
		{
			try
			{
				const response = await fetch(url);
				
				if (response.status === 200)
					return response.text();
				
				return new FetchError(
					response.status,
					response.statusText);
			}
			catch (e)
			{
				return new Error("Unknown error.");
			}
		}
		else if (typeof require === "function")
		{
			type HttpGet = typeof import("http").get;
			type HttpsGet = typeof import("https").get;
			type GetFn = HttpGet | HttpsGet;
			
			const getFn: GetFn = 
				url.startsWith("https:") ? require("https").get :
				url.startsWith("http:") ? require("http").get :
				null;
			
			if (getFn === null)
				throw Exception.invalidUri(url);
			
			return await new Promise<string | Error>(resolve =>
			{
				getFn(url, response =>
				{
					const data: string[] = [];
					
					response.on("data", chunk =>
					{
						data.push(typeof chunk === "string" ?
							chunk :
							chunk.toString("utf8"));
					});
					
					response.on("error", error =>
					{
						resolve(error);
					});
					
					response.on("end", () =>
					{
						resolve(data.join(""));
					});
				});
				
				return "";
			});
		}
		
		throw Exception.unsupportedPlatform();
	}
	
	/**
	 * 
	 */
	export class FetchError extends Error
	{
		constructor(
			readonly statusCode: number,
			readonly statusText: string)
		{ super(); }
	}
	
	declare function fetch(...args: unknown[]): any;
}
