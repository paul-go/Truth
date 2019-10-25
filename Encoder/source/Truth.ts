
namespace Encoder
{
	export const Header = `
any
object : any
string : any
number : any
bigint : any
boolean : any

/".+" : string
/(\+|-)?(([1-9]\d{0,17})|([1-8]\d{18})|(9[01]\d{17})) : number
/(0|([1-9][0-9]*)) : bigint
/(true|false) : boolean

`;

	const join = require("path").join as typeof import("path").join;
	
	export async function compile(configPath: string)
	{
		if (!configPath.endsWith("truthconfig.js")) configPath = join(configPath, "/truthconfig.js");
		
		const config = safe(() => require(configPath), "Couldn't read config file!") as {
				Backer: boolean;
				SourceDir: string;
				TargetDir: string;
				DataPatterns: Record<string, RegExp>
		};
		
		const truthfiles = safe(() => 
			Truth.Fs.module.readdirSync(join(process.cwd(), config.SourceDir)), 
			"Couldn't read source folder!", true
		).filter(x => x.endsWith(".truth"));
		const content = [
			config.Backer ? Header : "", 
			...truthfiles.map(x => safe(
				() => Truth.Fs.module.readFileSync(join(process.cwd(), x), "utf-8"),
				"Couldn't read truth file!"
			))].join("\n");
		const document = await Truth.parse(content);
		
		document.program.verify();
		
		for (const fault of document.program.faults.each())
			console.error(fault);
		
		let code = new Code();
		
		const drill = (type: Truth.Type) => 
		{
			code.add(Type.fromTruth(code, type));
			for (const sub of type.contents)
				drill(sub);
		};
		
		for (const type of document.types)
			drill(type);
			
		code.link();
			
		for (const key in config.DataPatterns)
		{
			let temp = code.extractData(config.DataPatterns[key]);
			code = temp.code;
			safe(() => Truth.Fs.module.writeFileSync(
				join(process.cwd(), config.TargetDir, key + ".data.json"), 
				stringify(temp.data)
			), "Couldn't read source folder!", true);
		}
	
		safe(() => Truth.Fs.module.writeFileSync(
			join(process.cwd(), config.TargetDir, "code.json"),
			stringify(code)
		), "Couldn't read source folder!", true);
			 
	}
}  