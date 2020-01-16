
namespace Truth
{
	/** */
	export const UriReader = new class UriReader
	{
		/**
		 * Attempts to read the contents of the given URI.
		 * If an error is generated while trying to read a file 
		 * at the specified location, the errors is returned.
		 */
		async tryRead(uri: KnownUri)
		{
			if (uri.protocol === UriProtocol.file)
				return await readFile(uri.toString());
			
			else if (uri.protocol === UriProtocol.http ||
				uri.protocol === UriProtocol.https)
				return await fetchFn(uri);
			
			throw Exception.notImplemented();
		}
	}();
	
	/** */
	const fileExists = (path: string) =>
		new Promise<boolean>((resolve, reject) =>
		{
			Fs.module.exists(path, resolve);
		});
	
	/** */
	const readFile = (path: string, opts = "utf8") =>
		new Promise<string | Error>(resolve =>
		{
			Fs.module.readFile(path, opts, (error, data) =>
			{
				resolve(error && error.errno ?
					error :
					data || "");
			});
		});
	
	/** */
	const writeFile = (path: string, data: string, opts = "utf8") =>
		new Promise<null | Error>(resolve =>
		{
			Fs.module.writeFile(path, data, opts, error =>
			{
				resolve(error || null);
			});
		});
	
	/**
	 * Provides browser-style fetch functionality.
	 */
	async function fetchFn(uri: KnownUri): Promise<string | Error>
	{
		const url = uri.toString();
		
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
				uri.protocol === UriProtocol.https ? require("https").get :
				uri.protocol === UriProtocol.http ? require("http").get :
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
