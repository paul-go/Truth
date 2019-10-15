
namespace Encoder 
{
	export async function run()
	{
		compile(process.cwd()).catch(x => console.error(x));
	}
}