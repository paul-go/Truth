
namespace Backer.TruthTalk
{	
	export function Query(...args: any[])
	{
		const ast = tt(...args);
		const cursors = new CursorSet(...Object.values(DataGraph));
		
		cursors.query(ast);
		
		return cursors.snapshot();
	}
}
