
namespace make
{
	/**
	 * Reads the JSON file at the given path, attempts to parse it,
	 * and throws an errors in the case when it could not be parsed.
	 */
	export function readJson(jsonFilePath: string): { [key: string]: any }
	{
		if (!Fs.existsSync(jsonFilePath))
			throw new Error("File does not exist: " + jsonFilePath);
		
		const jsonFileText = Fs.readFileSync(jsonFilePath).toString("utf-8");
		const jsonObject = (() =>
		{
			try
			{
				return JSON.parse(jsonFileText);
			}
			catch (e)
			{
				return new Error(
					`File ${jsonFilePath} contains invalid JSON. ` +
					`Error was: ` + e.message
				);
			}
		})();
		
		if (!(jsonObject instanceof Object))
			throw jsonObject;
		
		return jsonObject;
	}
	
	/**
	 * Writes a formatted JSON object to the specified file path.
	 */
	export function writeJson(jsonFilePath: string, jsonObject: any)
	{
		Fs.writeFileSync(jsonFilePath, JSON.stringify(jsonObject, null, "\t"));
	}
	
	/**
	 * Returns a randomly generated string.
	 */
	export function random()
	{
		const num = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		return num.toString(36);
	}
	
	/**
	 * Recursively reads the contents of the folder at
	 * the specified path.
	 */
	export function readDirRecursiveSync(path: string)
	{
		const results: string[] = [];
		const filePaths = Fs.readdirSync(path);
		
		for (const filePath of filePaths)
		{
			const fullFilePath = path + "/" + filePath;
			const stat = Fs.statSync(fullFilePath);
			
			if (stat && stat.isDirectory())
				results.push(...results.concat(readDirRecursiveSync(fullFilePath)));
			else
				results.push(fullFilePath);
		}
		
		return results;
	}
}
