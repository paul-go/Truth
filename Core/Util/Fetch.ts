import * as Https from "https";


/**
 * @internal
 * A class that provides browser-style fetch functionality,
 * but with the ability to change this functions behavior
 * with a custom implementation.
 */
export class Fetch
{
	/**
	 * Assigns a new implementation of the fetch function.
	 */
	static override(fetchFn: (url: string) => Promise<string | Error>)
	{
		this.fetchFn = fetchFn;
	}
	
	/** */
	static exec(url: string)
	{
		return this.fetchFn(url);
	}
	
	/** */
	private static fetchFn = (url: string) =>
	{
		return new Promise<string | Error>(resolve =>
		{
			const req = Https.get(url, response =>
			{
				const data: string[] = [];
				
				response.on("data", chunk =>
				{
					data.push(typeof chunk === "string" ?
						chunk :
						chunk.toString("utf8"));
				});
				
				response.on("end", () =>
				{
					resolve(data.join(""));
				});
			});
			
			req.on("error", error =>
			{
				resolve(error);
			});
		});
	}
}
