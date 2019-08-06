
namespace make
{
	/**
	 * 
	 */
	export async function publish(options: IPublishOptions)
	{
		// Make sure the publish directory is present
		const stat = Fs.lstatSync(options.directory);
		if (!stat.isDirectory())
			throw new Error("Not a directory: " + options.directory);
		
		FsExtra.readdirSync(options.directory);
		
		// Save the new package.json file to the bundle folder
		const packageJson = readJson(options.packageFile);
		delete packageJson.jest;
		delete packageJson.scripts;
		delete packageJson.devDependencies;
		
		const publishSpecificJson = {
			files: readDirRecursiveSync(options.directory)
				.filter(path =>
				{
					const fileName = Path.parse(path).base;
					return !fileName.startsWith(".") && fileName !== "package.json";
				})
				.map(path => path.slice(Path.parse(path).dir.length + 1))
		};
		
		const packageJsonFinal = Object.assign(
			{},
			packageJson,
			publishSpecificJson,
			options.packageFileChanges);
		
		// Bump the version if necessary
		const sourceVersion = SemVer.parse(packageJsonFinal.version);
		if (sourceVersion === null)
			throw new Error("package.json includes an invalid version:" + packageJsonFinal.version);
		
		const publishedVersions = options.registries
			.map(registry => getPublishedVersion(packageJsonFinal.name, registry))
			.filter((ver): ver is InstanceType<SemVer["SemVer"]> => ver !== null);
		
		if (publishedVersions.length > 0)
		{
			const latestPublished = SemVer.sort(publishedVersions)[0];
			if (SemVer.lte(sourceVersion, latestPublished))
				packageJsonFinal.version = SemVer.inc(latestPublished, "patch")!;
		}
		
		// Write out the package.json
		const packageJsonPath = Path.join(options.directory, "package.json");
		writeJson(packageJsonPath, packageJsonFinal);
		
		for (const registry of options.registries)
		{
			const opts = { cwd: options.directory };
			const registryParam = getRegistryParam(registry);
			await make.shell(`npm publish` + registryParam, opts);
		}
	}
	
	/** */
	function getPublishedVersion(packageName: string, registry = "")
	{
		let command = `npm show ${packageName} version${getRegistryParam(registry)}`;
		const output = make.shellSync(command);
		
		if (output instanceof Error)
		{
			if (output.message.includes("is not in the npm registry."))
				return null;
			
			throw output;
		}
		
		return SemVer.parse(output);
	}
	
	/** */
	function getRegistryParam(registry: string | undefined)
	{
		return registry && registry.trim() ?
			" --registry " + registry.trim() :
			"";
	}
	
	/**
	 * 
	 */
	export interface IPublishOptions
	{
		/**
		 * The path to the folder that contains the files to include
		 * in the bundle.
		 * Defaults to "./bundle"
		 */
		directory: string;
		
		/**
		 * Specifies the path to the package.json file to use as a template.
		 * Defaults to "./package.json"
		 */
		packageFile: string;
		
		/**
		 * Specifies a JSON object to layer ontop of the package.json loaded
		 * via the "packagePath" setting.
		 */
		packageFileChanges: { [key: string]: any; };
		
		/**
		 * Specifies the list of npm-compatible registries to publish to.
		 */
		registries: ("npm" | string)[];
	}
	
	
	
	
	
	/** * /
	function getLatestVersion(...versions: [number, number, number][])
	{
		if (versions.length === 0)
			throw new Error("At least one version must be specified.");
		
		if (versions.length === 1)
			return versions[0];
		
		for (let segment = -1; ++segment < 3;)
		{
			const distinct = versions
				.map(version => version[segment])
				.filter((v, i, a) => a.indexOf(v) === i);
			
			
		}
		
		const allEqual = (idx: number) =>
		{
			versions.slice(1).every((verArray, verItem) => verAr[idx]
		}
	}*/
	
	/** */
	function parseVersion(versionText: string)
	{
		const values = <[number, number, number]>versionText
			.split(".")
			.map(numText => parseInt(numText));
		
		if (values.length !== 3 || values.some(v => v !== v))
			return [0, 0, 0];
		
		return values;
	}
}
