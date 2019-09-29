
namespace make
{
	/**
	 * 
	 */
	export async function publish(options: IPublishOptions)
	{
		const directory = options.directory || "./bundle";
		const packageFile = options.packageFile || "./package.json";
		
		// Make sure the publish directory is present
		const stat = Fs.lstatSync(directory);
		if (!stat.isDirectory())
			throw new Error("Not a directory: " + directory);
		
		FsExtra.readdirSync(directory);
		
		// Save the new package.json file to the bundle folder
		const packageJson = readJson(packageFile);
		delete packageJson.jest;
		delete packageJson.scripts;
		delete packageJson.devDependencies;
		
		const publishSpecificJson = {
			files: readDirRecursiveSync(directory)
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
			options.packageFileChanges || {});
		
		// Remove any entries that are set to null or undefined
		for (const [key, value] of Object.entries(packageJsonFinal))
			if (value === null || value === void 0)
				delete packageJsonFinal[key];
		
		// Bump the version if necessary
		const sourceVersion = SemVer.parse(packageJsonFinal.version);
		if (sourceVersion === null)
			throw new Error("package.json includes an invalid version:" + packageJsonFinal.version);
		
		const rawRegistries = Array.isArray(options.registries) ?
			options.registries :
			["npm"];
		
		const registries = rawRegistries
			.map(r => r === "npm" ? "https://registry.npmjs.org" : r);
		
		const publishedVersions = registries
			.map(registry => getPublishedVersion(packageJsonFinal.name, registry))
			.filter((ver): ver is InstanceType<SemVer["SemVer"]> => ver !== null);
		
		if (publishedVersions.length > 0)
		{
			const latestPublished = SemVer.sort(publishedVersions)[0];
			if (SemVer.lte(sourceVersion, latestPublished))
				packageJsonFinal.version = SemVer.inc(latestPublished, "patch")!;
		}
		
		// Write out the package.json
		const packageJsonPath = Path.join(directory, "package.json");
		writeJson(packageJsonPath, packageJsonFinal);
		
		for (const registry of registries)
		{
			const registryParam = getRegistryParam(registry);
			const tag = options.tag ?
				" --tag " + options.tag :
				"";
			
			await make.shell(`npm publish ${directory}` + registryParam + tag);
		}
	}
	
	/** */
	function getPublishedVersion(packageName: string, registry = "")
	{
		const command = `npm show ${packageName} version${getRegistryParam(registry)}`;
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
		directory?: string;
		
		/**
		 * Specifies the path to the package.json file to use as a template.
		 * Defaults to "./package.json"
		 */
		packageFile?: string;
		
		/**
		 * Specifies a JSON object to layer ontop of the package.json loaded
		 * via the "packagePath" setting.
		 */
		packageFileChanges?: { [key: string]: any };
		
		/**
		 * Specifies the list of npm-compatible registries to publish to.
		 * An empty array can be used for debugging to see what files will
		 * be published, but won't actually send any files to any public
		 * registry.
		 */
		registries?: ("npm" | string)[];
		
		/**
		 * Adds tags to the package
		 */
		tag?: string;
	}
}
