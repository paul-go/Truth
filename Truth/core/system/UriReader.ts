
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
		async tryRead(uri: Uri)
		{
			if (uri.protocol === UriProtocol.file)
				return await readFile(uri.toStoreString());
			
			else if (uri.protocol === UriProtocol.http ||
				uri.protocol === UriProtocol.https)
				return await Fetch.exec(uri.toStoreString());
			
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
}
