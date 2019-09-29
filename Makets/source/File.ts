
namespace make
{
	/**
	 * Copies the source file or folder to the destination file or folder.
	 * To differentiate between a file and a folder, be sure to suffix
	 * paths with a "/" character to indicate a folder.
	 */
	export function copy(src: string, dst: string, filterFn?: (filePath: string) => boolean)
	{
		const srcStat = Fs.lstatSync(src);
		const dstStat = Fs.existsSync(dst) ? Fs.lstatSync(dst) : null;
		const srcIsDir = srcStat.isDirectory();
		const dstIsDir = dstStat ? dstStat.isDirectory() : false;
		
		if (srcIsDir)
		{
			if (dstIsDir)
			{
				// Copy all the files from one directory to another
				FsExtra.copySync(src, dst, {
					recursive: true,
					overwrite: true
				});
			}
			else
			{
				throw new Error("Cannot copy a directory to a file.");
			}
		}
		else if (dstIsDir)
		{
			const parsed = Path.parse(src);
			const dstPath = Path.join(dst, parsed.base);
			FsExtra.removeSync(dstPath);
			FsExtra.copyFileSync(src, dstPath);
		}
		else
		{
			if (FsExtra.existsSync(dst))
				FsExtra.removeSync(dst);
			
			FsExtra.copyFileSync(src, dst);
		}
	}
	
	/**
	 * Creates the directory structure at the specified location, if it doesn't exist
	 * already. If the path is omitted, a temporary directory is created in the 
	 * working directory.
	 * 
	 * @returns The absolute path of the created directory.
	 */
	export function directory(path?: string)
	{
		const pathValue = path || "./temp-" + Math.random().toString().slice(-10);
		make.shellSync("mkdir -p " + pathValue);
		return Path.resolve(pathValue);
	}
	
	/**
	 * Adds the specified prefix and suffix strings to the contents of the specified 
	 * JavaScript file. The algorithm takes into account hashbang prefixes, as well
	 * as source map comments.
	 */
	export function wrap(options: {
		in: string;
		out?: string;
		prefix?: string;
		suffix?: string;
	})
	{
		const outPath = options.out || options.in;
		const fileContent = Fs.readFileSync(options.in).toString("utf8");
		const prefix = options.prefix || "";
		const suffix = options.suffix ? "\n" + options.suffix : "";
		
		let section1 = "";
		let section2 = "";
		let section3 = "";
		
		(() =>
		{
			let prefixInsertPosition = 0;
			if (fileContent.startsWith("#!/"))
			{
				prefixInsertPosition = fileContent.indexOf("\n") + 1;
				if (prefixInsertPosition === 0)
					prefixInsertPosition = fileContent.length;
			}
			
			const smu = ["\n//# ", "sourceMappingURL="].join("");
			let suffixInsertPosition = fileContent.lastIndexOf(smu);
			if (suffixInsertPosition < 0)
				suffixInsertPosition = fileContent.length;
			
			section1 = fileContent.slice(0, prefixInsertPosition);
			section2 = fileContent.slice(prefixInsertPosition, suffixInsertPosition);
			section3 = fileContent.slice(suffixInsertPosition);
		})();
		
		Fs.writeFileSync(outPath,
			section1 +
			prefix + 
			section2 + 
			suffix +
			section3);
	}
	
	/**
	 * Deletes the specified file from the file system.
	 */
	(<any>make).delete = function(src: string)
	{
		if (Fs.existsSync(src))
			Fs.unlinkSync(src);
	};
}

/**
 * Deletes the specified file from the file system.
 */
declare class make
{
	static delete(src: string): void;
}
