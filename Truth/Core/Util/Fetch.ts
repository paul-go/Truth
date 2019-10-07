
namespace Truth
{
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
		static async exec(url: string): Promise<string | Error>
		{
			const uri = Uri.tryParse(url);
			if (!uri)
				throw Exception.invalidUri(url);
			
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
