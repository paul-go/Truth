
export default class Flags
{
	static fromObject(obj: Record<string, boolean>)
	{
		
	}
	
	constructor(private fields: string[], private flags: number = 0) {}
	
	setFlag(flag: string, value: boolean)
	{
		const point = this.fields.indexOf(flag);
		if(point < 0) 
			return this;
		const mask = 1 << point;
		if (value)
			this.flags |= mask;
		else 
			this.flags &= ~mask;
		return this;
	}
	
	getFlag(flag: string)
	{
		const point = this.fields.indexOf(flag);
		if(point < 0) 
			return false;
		const mask = 1 << point;
		return this.flags & mask ? true : false; 
	}
	
	toJSON()
	{
		return this.flags;
	}
	
}