
namespace make
{
	/**
	 * Runs the specified npm script.
	 */
	export function run(scriptName: string)
	{
		make.shell(`npm run ` + scriptName);
	}
}
