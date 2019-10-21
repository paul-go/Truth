
namespace Backer.TruthTalk.Test
{
	//> eqwe
	(async function()
	{
		await Code.link("/Backer/TruthTalk.Test/code.json", "/Backer/TruthTalk.Test/Product.data.json");
		
		const {
			Product
		} = Schema;
		
		const ast = tt(
			tt.is(),
		);
		console.log(ast);
		Execute({}, ast);
	})();	
}
