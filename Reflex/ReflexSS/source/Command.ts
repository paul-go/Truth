
namespace Reflex.SS
{
	/** */
	export type CommandValue =
		string |
		number | 
		Command | 
		Unit | 
		(string | number | Command | Unit)[];
	
	/**
	 * A class that represents either a CSS declaration, such as "color: red",
	 * or a CSS function call, such as "rgb(1, 2, 3)".
	 */
	export class Command
	{
		constructor(
			/**
			 * Stores the name of the function that was used to make
			 * this call, for example "textAlign".
			 */
			readonly callingName: string,
			/**
			 * Stores the values that were passed in the call to the function,
			 * for example "center" in the case of ss.textAlign("center").
			 */
			readonly values: CommandValue[] = [])
		{
			const chars = callingName.split("");
			for (let i = chars.length; i-- > 0;)
			{
				const c = chars[i];
				
				if (Util.isUpperCase(c))
				{
					chars[i] = c.toLowerCase();
					chars.splice(i, 0, "-");
				}
			}
			
			this.hypenatedName = chars.join("");
		}
		
		/**
		 * Stores the name of the call in it's hypenated format,
		 * for example, "text-align".
		 */
		readonly hypenatedName: string;
		
		/** */
		toDeclarationString()
		{
			return this.hypenatedName + ": " + this.stringifyValues() + ";";
		}
		
		/** */
		toFunctionString()
		{
			return this.hypenatedName + "(" + this.stringifyValues() + ")";
		}
		
		/** */
		private stringifyValues(): string
		{
			// 
			const stringifyOne = (val: unknown) =>
			{
				if (typeof val === "string")
					return normalizeString(val);
				
				else if (typeof val === "number")
					return String(val);
				
				else if (val instanceof Unit)
					return val.toString();
				
				else if (val instanceof Command)
					return val.toFunctionString();
				
				return "";
			};
			
			// 
			const normalizeString = (str: string) =>
			{
				const has = {
					single: false,
					double: false,
					space: false,
					parens: false,
					highRange: false
				};
				
				for (let i = str.length; i-- > 0;)
				{
					const c = str[i];
					
					if (c === "'")
						has.single = true;
					
					else if (c === '"')
						has.double = true;
					
					else if (c === " " || c === "\t")
						has.space = true;
					
					else if (c === "(" || c === ")")
						has.parens = true;
					
					else if (str.charCodeAt(i) > 126)
						has.highRange = true;
				}
				
				if (Object.values(has).every(value => !value))
					return str;
				
				if (!has.double)
					return `"${str}"`;
				
				if (!has.single)
					return `'${str}'`;
				
				const chars = str.split("");
				for (let i = chars.length; i-- > 0;)
					if (chars[i] === "'")
						chars.splice(i, 0, "\\");
				
				return `"${chars.join("")}"`;
			};
			
			// Stores a 2-dimensional string array, where the first dimension
			// represents the values that are separated by commas, and the
			// second dimension represents the values that are separated by
			// spaces.
			const out: string[][] = [];
			const cur: string[] = [];
			
			for (const value of this.values)
			{
				if (Array.isArray(value))
				{
					if (cur.length)
					{
						out.push(cur.slice());
						cur.length = 0;
					}
					
					out.push(value
						.map(v => stringifyOne(v))
						.filter(v => !!v));
				}
				else
				{
					cur.push(stringifyOne(value));
				}
			}
			
			if (cur.length)
				out.push(cur);
			
			return out.map(arrayL1 => arrayL1.join(" ")).join(", ");
		}
	}
}
