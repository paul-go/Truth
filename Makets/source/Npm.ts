
namespace make.npm
{
	/**
	 * Extracts files out of the npm module, and saves them to the specifed
	 * location.
	 */
	export function extract(
		moduleName: string,
		moduleFiles: string | string[],
		targetDirectory: string)
	{
		const tarUrl = make.shellSync(`npm view ${moduleName} dist.tarball`);
		if (tarUrl instanceof Error)
			throw tarUrl;
		
		const dirPath = make.directory();
		make.shellSync(`wget ${tarUrl} -o ` + dirPath);
		
		const tarFileName = tarUrl.slice(tarUrl.lastIndexOf("/") + 1);
		const tarFilePath = Path.join(dirPath, tarFileName);
		make.shellSync(`tar xC ${tarFilePath}`);
		
		const moduleFilesArray = typeof moduleFiles === "string" ? 
			[moduleFiles] :
			moduleFiles;
		
		for (const moduleFile of moduleFilesArray)
		{
			const moduleFilePathAbsolute = Path.join(dirPath, moduleFile);
			make.copy(moduleFilePathAbsolute, targetDirectory);
		}
		
		if (Fs.existsSync(dirPath))
			Fs.unlinkSync(dirPath);
	}
	
	/**
	 * Executes the npm publish command.
	 */
	export function publish(path: string, registry = "", tag?: string)
	{
		const tagParam = tag ? " --tag " + tag : "";
		const registryParam = registry ? " --registry " + registry.trim() : "";
		make.shellSync(`npm publish ${path}` + registryParam + tagParam);
	}
	
	/**
	 * 
	 */
	export function latestOf(packageNames: string[], registry = "")
	{
		const out: { [packageName: string]: string }  = {};
		
		for (const pkg of packageNames)
		{
			const ver = getPublishedVersion(pkg, registry);
			if (ver)
				out[pkg] = "^" + ver.format();
		}
		
		return out;
	}
	
	/** */
	export function getPublishedVersion(packageName: string, registry = "")
	{
		const registryParam = registry ? " --registry " + registry.trim() : "";
		const command = `npm show ${packageName} version${registryParam}`;
		const output = make.shellSync(command);
		
		if (output instanceof Error)
		{
			if (output.message.includes("is not in the npm registry."))
				return null;
			
			throw output;
		}
		
		return SemVer.parse(output);
	}
}
