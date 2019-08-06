
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
			const proc = ChildProcess.exec(cmd, fullEnvVars );
			
			proc.stdout!.on("data", (data: any) =>
			{
				process.stdout.write(data);
			});
			
			proc.stderr!.on("data", (data: any) =>
			{
				process.stderr.write(data);
			});
			
			proc.on("exit", (code: number) =>
			{
				resolve();
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
