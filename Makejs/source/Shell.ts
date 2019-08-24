
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
			const proc = ChildProcess.exec(cmd, { env: fullEnvVars });
			proc.stdout!.pipe(process.stdout);
			proc.stderr!.pipe(process.stderr);
			proc.on("exit", (code: number) =>
			{
				console.log("->", cmd, code);
				resolve();
			});
		});
	}

	/**
	 * Spawns a process with given arguments.
	 */
	export function spawn(exe: string, args: string[]): ReturnOfSpawn
	{
		const proc = ChildProcess.spawn(exe, args, {
			stdio: "inherit",
		});
		const promise = new Promise<void>((resolve, reject) => 
		{
			proc.on("close", function(code) 
			{ 
				if(code < 0) reject("Error detected"); else resolve();
			});
		});
		return { proc, promise };
	}

	/**
	 * Return type of spawn function
	 */
	export type ReturnOfSpawn = {
    proc: ReturnType<typeof ChildProcess.spawn>;
    promise: Promise<void>;
	};
	
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
