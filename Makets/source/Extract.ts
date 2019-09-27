
namespace make
{
	/**
	 * Extracts files out of the npm module, and saves them to the specifed
	 * location.
	 */
	export function extractNpm(
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
}
