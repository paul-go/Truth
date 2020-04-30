
namespace CoverTruth
{
	async function coverSimpleUriChange()
	{
		const [doc] = await createLanguageCover("a");
		doc.updateUri("./new.truth");
	}
}
