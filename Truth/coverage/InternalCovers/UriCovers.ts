
namespace Truth
{
	function coverUriParse()
	{
		const parsed = Truth.parseUri("http://localhost/??query");
		return () => true;
	}
}
