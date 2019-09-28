
export class Bitfield 
{
	constructor(public flags: number = 0)
	{
		
	}
	
	get size()
	{
		let temp = this.flags;
		let i = 0;
		while(temp) 
		{
			i++;
			temp = temp >> 1;
		}
		return i;
	}
	
	/**
	 * 
	 */
	set(point: number, value: boolean)
	{
		if(point < 0) 
			return this;
		const mask = 1 << point;
		if (value)
			this.flags |= mask;
		else 
			this.flags &= ~mask;
		return this;
	}
	
	/**
	 * 
	 */
	get(point: number)
	{
		if(point < 0) 
			return false;
		const mask = 1 << point;
		return this.flags & mask ? true : false; 
	}
	
	/**
	 * 
	 */
	toJSON()
	{
		return this.flags;
	}
}

export default class Flags extends Bitfield
{
	/**
	 * 
	 */
	constructor(private fields: string[], flags: number = 0) {
		super(flags);
	}
	
	/**
	 * 
	 */
	setFlag(flag: string, value: boolean)
	{
		const point = this.fields.indexOf(flag);
		return super.set(point, value);
	}
	
	/**
	 * 
	 */
	getFlag(flag: string)
	{
		const point = this.fields.indexOf(flag);
		return super.get(point);
	}
}