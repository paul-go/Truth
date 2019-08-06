
namespace make
{
	/**
	 * Creates a JXA Mac OS X app at the specified location.
	 */
	export function macApp(
		inputJsFilePath: string,
		outputAppFilePath: string)
	{
		if (!outputAppFilePath.endsWith(".app"))
			throw new Error(`"${outputAppFilePath} does not end in ".app"`);
		
		ChildProcess.execSync(`osacompile -l JavaScript -o ${outputAppFilePath} ${inputJsFilePath}`);
	}
	
	/**
	 * 
	 */
	export function macIcon(
		inputPngFilePath: string,
		appBundlePath: string,
		optimize = true)
	{
		
		if (!inputPngFilePath.endsWith(".png"))
			throw new Error("Icon image must be a .png file.");
		
		const dimsCmd = `sips ${inputPngFilePath} --getProperty pixelWidth --getProperty pixelHeight`;
		const [imageWidth, imageHeight] = <[number, number]>ChildProcess.execSync(dimsCmd)
			.toString("utf8")
			.split("\n")
			.map(s => s.trim())
			.slice(1)
			.map(s => parseInt(s.split(":")[1], 10));
		
		if (imageWidth !== 1024 || imageHeight !== 1024)
			throw new Error(`Dimensions of image ${inputPngFilePath} are not 1024x1024`);
		
		class IconParameters
		{
			constructor(
				readonly size: number,
				readonly scale: number)
			{ }
			
			get iconName()
			{
				return this.scale !== 1 ?
					`icon_${this.size}x${this.size}.png` :
					`icon_${this.size}x${this.size}@2x.png`;
			}
		}
		
		const iconParamsList = [
			new IconParameters(16, 1),
			new IconParameters(16, 2),
			new IconParameters(32, 1),
			new IconParameters(32, 2),
			new IconParameters(64, 1),
			new IconParameters(64, 2),
			new IconParameters(128, 1),
			new IconParameters(128, 2),
			new IconParameters(256, 1),
			new IconParameters(256, 2),
			new IconParameters(512, 1),
			new IconParameters(512, 2),
			new IconParameters(1024, 1),
			new IconParameters(1024, 2)
		];
		
		const tempDir = "./0" + random();
		const iconSetDir = Path.join(tempDir, `applet.iconset`);
		FsExtra.mkdirpSync(iconSetDir);
		
		for (const iconParam of iconParamsList)
			ChildProcess.execSync(
				`sips -z ${iconParam.size} ${iconParam.size} ${inputPngFilePath} ` +
				`--out ${Path.join(iconSetDir, iconParam.iconName)}`);
		
		if (optimize && hasImageOptim())
		{
			console.log("Optimizing icon image files. This may take a while.");
			ChildProcess.execFileSync(`imageoptim ${tempDir}/*.png`);
		}
		
		const icnsPath = "./bundle/Fastenpages.app/Contents/Resources/applet.icns";
		
		if (Fs.existsSync(icnsPath))
			FsExtra.removeSync(icnsPath);
		
		ChildProcess.execSync(`iconutil -c icns ${iconSetDir} -o ${icnsPath}`);
		touch(appBundlePath);
		FsExtra.removeSync(tempDir);
	}
	
	/** */
	function hasImageOptim()
	{
		return ChildProcess.execSync("which imageoptim").toString("utf8").trim().length > 0;
	}
	
	/**
	 * Causes the Finder application in Mac OS X to refresh the icon
	 * associated with the specified file.
	 */
	export function touch(filePath: string)
	{
		ChildProcess.execSync("touch " + filePath);
	}
}
