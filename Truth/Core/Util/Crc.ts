import * as X from "../X";


/**
 * A class that encapsulates CRC functionality.
 */
export class Crc
{
	private constructor() { }
	
	/**
	 * Calculates a numeric CRC from the specified string, and returns the
	 * code as a 4-character ASCII byte string.
	 */
	static calculate(text: string): string;
	/**
	 * Calculates a numeric CRC from the specified string, and returns the
	 * code as a 4-number byte array.
	 */
	static calculate(text: string, type: typeof Number): number[];
	static calculate(text: string, type?: typeof Number): string | number[]
	{
		const seed = 0;
		const len = text.length;
		let i = 0;
		let c = seed ^ -1;
		let d = 0;
		let e = 0;
		
		while (i < len)
		{
			d = text.charCodeAt(i++);
			
			if (d < 0x80)
			{
				c = (c >>> 8) ^ table[(c ^ d) & 0xFF];
			}
			else if (d < 0x800)
			{
				c = (c >>> 8) ^ table[(c ^ (192 | ((d >> 6) & 31))) & 0xFF];
				c = (c >>> 8) ^ table[(c ^ (128 | (d & 63))) & 0xFF];
			}
			else if (d >= 0xD800 && d < 0xE000)
			{
				d = (d & 1023) + 64;
				e = text.charCodeAt(i++) & 1023;
				
				c = (c >>> 8) ^ table[(c ^ (240 | ((d >> 8) & 7))) & 0xFF];
				c = (c >>> 8) ^ table[(c ^ (128 | ((d >> 2) & 63))) & 0xFF];
				c = (c >>> 8) ^ table[(c ^ (128 | ((e >> 6) & 15) | ((d & 3) << 4))) & 0xFF];
				c = (c >>> 8) ^ table[(c ^ (128 | (e & 63))) & 0xFF];
			}
			else
			{
				c = (c >>> 8) ^ table[(c ^ (224 | ((d >> 12) & 15))) & 0xFF];
				c = (c >>> 8) ^ table[(c ^ (128 | ((d >> 6) & 63))) & 0xFF];
				c = (c >>> 8) ^ table[(c ^ (128 | (d & 63))) & 0xFF];
			}
		}
		
		const bytes = [
			(255 << 4) & c,
			(255 << 3) & c,
			(255 << 2) & c,
			(255 << 1) & c
		];
		
		return type === Number ?
			bytes :
			String.fromCharCode(...bytes);
	}
}


/**
 * Stores a pre-computed signed CRC table.
 */
const table = (() =>
{
	const out = new Array(256);
	let c = 0;
	let n = -1;
	
	while (++n < 256)
	{
		c = n;
		
		for (let i = -1; ++i < 8;)
			c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		
		out[n] = c;
	}
	
	return new Int32Array(out);
})();

