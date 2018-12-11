import * as X from "../X";
import * as T from "../T";

import "../Framework/TestExtensions";


//
describe("Document Fills", () =>
{
	// Hooks are disabled for document tests
	beforeEach(() => X.HookRouter.disabled = true);
	afterEach(() => X.HookRouter.disabled = false);
	
	//
	test(".fill() with a simple document", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
				B
					C
		`);
		
		expect(doc.toString()).toBe(T.outdent`
			A
				B
					C
		`);
	});

	//
	test(".fill() with a document with bizarre formatting", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			Level : 
			Lev\\,el : Level, Level
				Level1 : Level
			Level2: Level
					Level3 :Level
						Level4  :  Level
						Level5, Level6 : Level
				Level7 , Level8 : Level
			Level9     ,Level10 : Level
					: Level
			Level 
		`);
		
		expect(doc.toString()).toBe(T.outdent`
			Level :
			Lev,el : Level, Level
				Level1 : Level
			Level2 : Level
				Level3 :Level
					Level4 : Level
					Level5, Level6 : Level
				Level7, Level8 : Level
			Level9, Level10 : Level
				: Level
			Level
		`);
	});
});
