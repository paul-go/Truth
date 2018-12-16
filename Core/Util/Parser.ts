import * as X from "../X";


/**
 * A general parsing utility class that provides consumption
 * methods that operate over a given input.
 */
export class Parser
{
	/**
	 * Constructs a new Parser object that operates over
	 * the specified input string, optionally starting at the
	 * specified position.
	 */
	constructor(input: string, startingPosition = 0)
	{
		this.input = input;
		this._position = startingPosition;
	}
	
	/**
	 * Attempts to consume the specified token immediately 
	 * following the cursor, and returns a boolean indicating
	 * whether the consumption was successful.
	 * 
	 * Reads from the parse stream, starting at the cursor,
	 * and ending at a position specified by the token parameter.
	 * 
	 * @param token If a string is specified, the method attempts
	 * to read this string from the point of the cursor. If a RegExp
	 * is specified, the method attempts to read a single character
	 * that matches the regular expression. If a number is specified,
	 * the method attempts to read this number of characters.
	 * 
	 * @returns The content read. In the case when a string or
	 * regular expression parameter was specified, but no match
	 * could be found, an empty string is returned.
	 */
	read(token: string | RegExp | number)
	{
		if (!token)
			throw new TypeError();
		
		const pos = this._position;
		
		if (typeof token === "string")
		{
			if (this.input.slice(pos, pos + token.length) === token)
			{
				this._position += token.length;
				return token;
			}
		}
		else if (typeof token === "number")
		{
			return this.input.slice(pos, pos + token);
		}
		else
		{
			const char = this.input.slice(pos, pos + 1);
			
			if (token.test(char))
			{
				this._position++;
				return char;
			}
		}
		
		return "";
	}
	
	/**
	 * Similar to the .read() method, but returns a boolean
	 * instead of the token specified.
	 */
	at(token: string | RegExp)
	{
		return !!this.read(token);
	}
	
	/**
	 * @returns A boolean value that indicates whether the
	 * specified string exists immediately at the position of
	 * the cursor.
	 */
	peek(token: string)
	{
		return this.input.substr(this._position, token.length) === token;
	}
	
	/**
	 * 
	 */
	atRealBackslash()
	{
		const esc = X.Syntax.escapeChar;
		return this.input.substr(this._position, 2) === esc + esc;
	}
	
	/**
	 * @returns A boolean value that indicates whether an
	 * escape character exists behind the current character.
	 * The algorithm used is respective of sequences of
	 * multiple escape characters.
	 */
	escaped()
	{
		let escaped = false;
		let backtrackPos = this._position;
		
		while (--backtrackPos >= 0)
			if (this.input[backtrackPos] === X.Syntax.escapeChar)
				escaped = !escaped;
		
		return escaped;
	}
	
	/**
	 * @returns A boolean value that indicates whether
	 * there are more characters to consume in the input.
	 */
	more()
	{
		return this._position < this.input.length;
	}
	
	/**
	 * Consumes any whitespace characters and floating
	 * escape characters.
	 * 
	 * @returns The number of characters consumes.
	 */
	whitespace()
	{
		const start = this._position;
		let pos = start;
		
		while (this.more())
		{
			this.read(X.Syntax.space);
			this.read(X.Syntax.tab);
			this.read(X.Syntax.escapeChar + X.Syntax.space);
			this.read(X.Syntax.escapeChar + X.Syntax.tab);
			
			if (this._position === pos)
				break;
			
			pos = this._position;
		}
		
		return pos - start;
	}
	
	/**
	 * Moves the parser back to the specified position.
	 */
	backtrack(position: number)
	{
		if (position < 0 || position > this._position)
			throw new RangeError();
		
		this._position = position;
	}
	
	/**
	 * Gets the position of the cursor from where
	 * reading takes place in the cursor.
	 */
	get position()
	{
		return this._position;
	}
	private _position = 0;
	
	/** */
	private readonly input: string;
}
