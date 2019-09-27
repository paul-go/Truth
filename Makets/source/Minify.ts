
namespace make
{
	/**
	 * 
	 */
	export function minify(inputJsFilePath: string, outputDir?: string)
	{
		if (!inputJsFilePath.endsWith(".js"))
			throw new Error(`File name "${inputJsFilePath}" does not end with the .js extension.`);
		
		if (!Fs.existsSync(inputJsFilePath))
			throw new Error(`File "${inputJsFilePath}" does not exist.`);
		
		const inputJsText = Fs.readFileSync(inputJsFilePath).toString("utf8");
		const inputJsFileParsed = Path.parse(inputJsFilePath);
		const outputJsFileName = inputJsFileParsed.base.replace(/\.js$/, ".min.js");
		const outputJsFilePath = Path.join(outputDir || inputJsFileParsed.dir, outputJsFileName);
		
		const output = Terser.minify(inputJsText, {
			compress: {
				keep_fnames: true,
				keep_classnames: true
			}
		});
		
		if (output.error)
			throw output.error;
		
		if (!output.code)
			throw new Error("No code generated.");
		
		Fs.writeFileSync(outputJsFilePath, output.code);
		
		const outBuffer = ZLib.deflateSync(output.code, { level: 9 });
		console.log(`Generated minified JavaScript file at "${outputJsFilePath}".`);
		console.log(`Size of minified file after GZip compression: ${outBuffer.length} bytes.`);
		
		return outputJsFilePath;
	}
}
