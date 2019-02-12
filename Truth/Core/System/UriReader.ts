import * as X from "../X";


/** */
export class UriReader
{
	/**
	 * Attempts to read the contents of the given URI.
	 * If an error is generated while trying to read a file 
	 * at the specified location, the errors is returned.
	 */
	static async tryRead(uri: X.Uri)
	{
		if (uri.protocol === X.UriProtocol.file)
			return await readFile(uri.toStoreString());
		
		else if (uri.protocol === X.UriProtocol.http ||
			uri.protocol === X.UriProtocol.https)
			return await X.Fetch.exec(uri.toStoreString());
		
		throw X.Exception.notImplemented();
	}
}


/** */
const fileExists = (path: string) =>
	new Promise<boolean>((resolve, reject) =>
	{
		X.Fs.module.exists(path, resolve);
	});


/** */
const readFile = (path: string, opts = "utf8") =>
	new Promise<string | Error>(resolve =>
	{
		X.Fs.module.readFile(path, opts, (error, data) =>
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
		X.Fs.module.writeFile(path, data, opts, error =>
		{
			resolve(error || null);
		});
	});
