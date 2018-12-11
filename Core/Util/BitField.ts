import * as X from "../X";


/**
 * 
 */
export class BitField
{
	/** */
	constructor(size: number)
	{
		this.size = size;
		const blocksLength = Math.ceil(size / 32);
		
		for (let i = blocksLength; i-- > 0;)
			this.blocks.push(0);
	}
	
	/** */
	has(bit: number): boolean
	{
		if (bit > this.size)
			throw X.ExceptionMessage.invalidArgument();
		
		const blockIndex = bit / 32 | 0;
		const blockBit = bit % 32;
		return (this.blocks[blockIndex] & (1 << blockBit)) !== 0;
	}
	
	/** */
	set(bit: number, value: boolean)
	{
		if (bit > this.size)
			throw X.ExceptionMessage.invalidArgument();
		
		const blockIndex = bit / 32 | 0;
		const blockBit = bit % 32;
		
		value ?
			this.blocks[blockIndex] |= 1 << blockBit :
			this.blocks[blockIndex] &= ~(1 << blockBit);
	}
	
	/** */
	reset(value: boolean)
	{
		this.blocks.fill(value ? ~0 : 0);
	}
	
	/** */
	and(field: BitField)
	{
		const out = new BitField(this.size);
		
		for (let i = this.size; --i >= 0;)
			out.blocks[i] = this.blocks[i] & field.blocks[i];
		
		return out;
	}
	
	/** */
	or(field: BitField)
	{
		const out = new BitField(this.size);
		
		for (let i = this.size; --i >= 0;)
			out.blocks[i] = this.blocks[i] | field.blocks[i];
		
		return out;
	}
	
	/** */
	xor(field: BitField)
	{
		const out = new BitField(this.size);
		
		for (let i = this.size; --i >= 0;)
			out.blocks[i] = this.blocks[i] ^ field.blocks[i];
		
		return out;
	}
	
	/** @returns Whether every bit in the field is off. */
	isEmpty()
	{
		return this.blocks.every(b => b === 0);
	}
	
	/** @returns Whether every bit in the field is on. */
	isFull()
	{
		return this.blocks.every(b => b === ~0);
	}
	
	/** */
	private readonly size: number;
	
	/** */
	private readonly blocks: number[] = [];
}
