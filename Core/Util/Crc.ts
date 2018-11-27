import * as X from "./X";


/**
 * A class that encapsulates CRC functionality.
 */
export class Crc
{
	private constructor() { }
	
	/**
	 * Calculates a numeric CRC from the specified string.
	 * @param seed A starting seed value, used in the case of a rolling CRC.
	 */
	static calculate(text: string, seed = 0)
	{
		const table = this.table;
		let len = text.length;
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
		
		return c ^ -1;
	}
	
	/**
	 * Pre-computes a signed CRC table.
	 */
	private static readonly table = (() =>
	{
		const table = new Array(256);
		let c = 0;
		let n = -1;
		
		while (++n < 256)
		{
			c = n;
			
			for (let i = -1; ++i < 8;)
				c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
			
			table[n] = c;
		}
		
		return new Int32Array(table);
	})();
}
