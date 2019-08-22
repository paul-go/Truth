
namespace make
{
	/**
	 * Runs the specified command on the shell, optionally with
	 * the specified environment variables.
	 */
	export async function shell(command: string, envVars?: object)
	{
		return new Promise(resolve =>
		{
			const cmd = command.replace(/[\r\n]/g, "").trim();
			const fullEnvVars = Object.assign({}, process.env, envVars || {});
			const proc = ChildProcess.exec(cmd, {env: fullEnvVars});
			proc.stdout!.pipe(process.stdout);
			proc.stderr!.pipe(process.stderr);
			proc.on("exit", (code: number) =>
			{
				console.log("->", cmd, code);
				resolve();
			});
		});
	}

	export async function spawn(exe: string, args: string[])
	{
		return new Promise((resolve, reject) => 
		{
			const proc = ChildProcess.spawn(exe, args, {
				stdio: "inherit",
			});
			proc.on("close", function(code) 
			{
				if (code < 0) 
					return reject("Error detected");
				return resolve();
			});
		});
	}
	
	/**
	 * Synchronously runs the specified command on the shell.
	 */
	export function shellSync(command: string): string | Error
	{
		try
		{
			const result = ChildProcess.execSync(command);
			return result.toString("utf8").trim();
		}
		catch (e)
		{
			return e;
		}
	}
}
