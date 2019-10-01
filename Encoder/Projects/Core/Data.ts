import CodeJSON from "./Code";

export default class DataJSON
{
	Records: [number] & string[];
	
	constructor(protected code: CodeJSON, protected pattern: RegExp)
	{
		console.log(code.filter(pattern).map(x => x.view.contents));
	}
}