
namespace make
{
	/**
	 * Defines the options for creating executables.
	 */
	export interface IExecutableOptions
	{
		/**
		 * The path of the interpreter.
		 * Defaults to "/usr/bin/env".
		 */
		path?: string;
		
		/**
		 * The name of the program to run.
		 * Defaults to "node".
		 */
		program?: string;
		
		/**
		 * The path to the JavaScript file to convert.
		 */
		file: string;
	}
	
	/**
	 * Adds a shebang and chmod's a JavaScript file so that it can be executed
	 * from the command line.
	 */
	export function executable(options: IExecutableOptions)
	{
		if (!Fs.existsSync(options.file))
			throw new Error(`File ${options.file} doesn't exist`);
		
		const shebang = `#!${options.path || "/usr/bin/env"} ${options.program || "node"}\n`;
		make.shellSync(`chmod +x ` + options.file);
		
		const fileText = Fs.readFileSync(options.file).toString("utf8");
		Fs.writeFileSync(options.file, shebang + fileText);
	}
}
