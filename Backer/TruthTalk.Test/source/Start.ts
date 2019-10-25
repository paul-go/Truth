
namespace Backer.TruthTalk.Test
{
	(async function()
	{
		await Code.link("/Backer/TruthTalk.Test/code.json", "/Backer/TruthTalk.Test/Product.data.json");
		
		const {
			Product,
			Something,
			string,
			number
		} = Schema;
		
		Query(
			tt.contents(),
			Something.Test,
			tt.containers()
		)
		.forEach(x => console.log(x && x[typeOf].name));
	})();	
}
