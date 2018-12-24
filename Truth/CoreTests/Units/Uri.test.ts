import * as X from "../X";
import "../Framework/TestExtensions";


//
describe("Uri Tests", () =>
{
	//
	test("Parse HTTP URI", () =>
	{
		const uri = X.Uri.parse("http://www.domain.com/file.truth//type/path")!;
		
		expect(uri).toBeTruthy();
		expect(uri.protocol).toBe(X.UriProtocol.http);
		expect(uri.ioPath).toEqual(["www.domain.com", "file.truth"]);
		expect(uri.typePath).toEqual(["type", "path"]);
		expect(uri.fileName).toBe("file.truth");
		expect(uri.fileNameBase).toBe("file");
		expect(uri.fileExtension).toBe("truth"); 
	});
});
