
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
			values: CommandValue[] = [])
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
			this._values = values.slice();
			
			for (const value of values)
				if (value instanceof Command)
					value.container = this;
		}
		
		/**
		 * Stores the values that were passed in the call to the function,
		 * for example "center" in the case of ss.textAlign("center").
		 */
		get values(): readonly CommandValue[]
		{
			return this._values;
		}
		private readonly _values: CommandValue[];
		
		/**
		 * Stores the object that owns this Command.
		 * 
		 * In the case when this Command refers to a CSS function, 
		 * such as rgb() or calc(), the container refers to another Command.
		 * 
		 * In the case when the Command refers to a CSS property,
		 * the container refers to a Rule.
		 * 
		 * In the case when the Command hasn't been connected
		 * anywhere, the container is null.
		 */
		private container: Command | Rule | null = null;
		
		/** */
		[Reflex.atom](destination: Rule)
		{
			destination.declarations.push(this);
			this.container = destination;
		}
		
		/**
		 * 
		 */
		recall(...values: CommandValue[])
		{
			if (!this.isDynamic)
				throw new Error(
					"Cannot recall this Command, because " +
					"it has not been marked as .dynamic()");
			
			let rule: Rule | null = null;
			let property: Command | null = null;
			
			if (this.container instanceof Rule)
			{
				rule = this.container;
				property = this;
			}
			else if (this.container)
			{
				property = this.container;
				while (property)
				{
					if (property.container instanceof Rule)
					{
						rule = property.container;
						break;
					}
					
					property = property.container;
				}
			}
			
			this._values.length = 0;
			this._values.push(...values);
			
			const nativeRule = rule && ruleAssociations.get(rule);
			if (nativeRule && property)
			{
				nativeRule.style.setProperty(
					property.hypenatedName,
					Command.serializeValues(property, true),
					this.isImportant ? "important" : "");
			}
		}
		
		/**
		 * Stores the name of the call in it's hypenated format,
		 * for example, "text-align".
		 */
		readonly hypenatedName: string;
		
		/**
		 * Converts this command to a valid CSS serialized value.
		 */
		toString(useFunctionSyntax?: boolean)
		{
			return Command.serialize(this, !useFunctionSyntax);
		}
		
		/**
		 * Causes the !important marker to be emitted at the end of the
		 * declaration emitted from this Command. Has no effect when
		 * this Command is not serialized as a property.
		 */
		important()
		{
			this.isImportant = true;
			return this;
		}
		
		private isImportant = false;
		
		/**
		 * Used to indicate that the value of the Command may change
		 * in the future (this prevents certain optimizations from occuring).
		 */
		dynamic()
		{
			this.isDynamic = true;
			return this;
		}
		
		private isDynamic = false;
		
		/**
		 * Converts the specified command into a fully serialized representation,
		 * producing a string result such as "property: value;" or "rgb(0, 0, 0)".
		 */
		private static serialize(command: Command, propertyLevel: boolean): string
		{
			const hn = command.hypenatedName;
			const valuesText = this.serializeValues(command, propertyLevel);
			
			return propertyLevel ?
				hn + ": " + valuesText + ";" :
				hn + "(" + valuesText + ")";
		}
		
		/**
		 * Converts the values of the specified command into a serialized
		 * representation, producing a string result such as "1px solid red".
		 */
		private static serializeValues(command: Command, propertyLevel: boolean)
		{
			const values = command.values;
			const isSingleDimension = values.every(v => !Array.isArray(v));
			const importantText = command.isImportant ? " !important" : "";
			
			if (isSingleDimension)
			{
				const c = ", ";
				const s = " ";
				const sep = propertyLevel ?
					specialCommaCases.includes(command.hypenatedName) ? c : s :
					specialSpaceCases.includes(command.hypenatedName) ? s : c;
				
				return values.map(v => this.serializeValue(v)).join(sep) + importantText;
			}
			else
			{
				// Stores a 2-dimensional string array, where the first dimension
				// represents the values that are separated by commas, and the
				// second dimension represents the values that are separated by
				// spaces.
				const out: string[][] = [];
				const cur: string[] = [];
				
				for (const value of values)
				{
					if (!Array.isArray(value))
						throw new Error("Invalid input.");
					
					if (cur.length)
					{
						out.push(cur.slice());
						cur.length = 0;
					}
					
					out.push(value
						.map(v => this.serializeValue(v))
						.filter(v => !!v));
				}
				
				return out.map(arrayL1 => arrayL1.join(" ")).join(", ") + importantText;
			}
		}
		
		/** */
		private static serializeValue(val: unknown)
		{
			if (typeof val === "string")
				return this.normalizeString(val);
			
			else if (typeof val === "number")
				return String(val);
			
			else if (val instanceof Unit)
				return val.toString();
			
			else if (val instanceof Command)
				return this.serialize(val, false)
			
			return "";
		};
		
		/** */
		private static normalizeString(str: string)
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
	}
	
	//
	const specialCommaCases = Object.freeze([
		"font-family"
	]);
	
	//
	const specialSpaceCases = Object.freeze([
		"calc",
		"rect"
	]);
}
