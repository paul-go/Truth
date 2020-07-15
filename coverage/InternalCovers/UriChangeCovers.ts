
namespace Cover
{
	async function coverSimpleUriChange()
	{
		const [doc] = await createLanguageCover("a");
		doc.updateUri("./new.truth");
	}
}
