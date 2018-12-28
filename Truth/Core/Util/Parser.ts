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
	constructor(input: string)
	{
		this.input = input.normalize();
		this._position = 0;
	}
	
	/**
	 * Attempts to read the specified token immediately 
	 * following the cursor.
	 * 
	 * @returns The content read. In the case when no
	 * match could be found, an empty string is returned.
	 */
	read(token?: string)
	{
		if (!token)
			throw new TypeError();
		
		const pos = this._position;
		
		if (this.input.substr(pos, token.length) === token)
		{
			this._position += token.length;
			return token;
		}
		
		return "";
	}
	
	/**
	 * Reads any whitespace characters and floating
	 * escape characters.
	 * 
	 * @returns The number of whitespace characters
	 * read.
	 */
	readWhitespace()
	{
		let count = 0;
		
		while (this.more())
		{
			const c = count;
			
			if (this.read(X.Syntax.tab))
				count++;
			
			if (this.read(X.Syntax.space))
				count++;
			
			if (this.read(X.Syntax.escapeChar + X.Syntax.space))
				count++;
			
			if (this.read(X.Syntax.escapeChar + X.Syntax.tab))
				count++;
			
			if (c === count)
				break;
		}
		
		return count;
	}
	
	/**
	 * Attempts to read a single stream-level grapheme from the
	 * parse stream, using unicode-aware extraction method.
	 * If the parse stream specifies a unicode escape sequence,
	 * such as \uFFFF, these are seen as 6 individual graphemes.
	 * 
	 * @returns The read grapheme, or an empty string in the case
	 * when there is no more content in the parse stream.
	 */
	readGrapheme()
	{
		if (this._position >= this.input.length)
			return "";
		
		const codeAtCursor = this.input.codePointAt(this._position) || -1;
		this._position += codeAtCursor > 0xFFFF ? 2 : 1;
		return String.fromCodePoint(codeAtCursor);
	}
	
	/**
	 * Reads graphemes from the parse stream, until either
	 * the cursor reaches one of the specified quit tokens,
	 * or the parse stream terminates.
	 */
	readUntil(...quitTokens: string[])
	{
		let stream = "";
		
		while (this.more())
		{
			if (quitTokens.some(t => this.peek(t)))
				break;
			
			stream += this.readGrapheme();
		}
		
		return stream;
	}
	
	/**
	 * Attempts to read the specified token from the parse stream,
	 * if and only if it's at the end of the parse stream.
	 */
	readThenTerminal(token: string)
	{
		if (this.peek(token) && this._position === this.input.length - token.length)
		{
			this._position += token.length;
			return token;
		}
		
		return "";
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
	 * @returns A boolean value that indicates whether the
	 * specified string exists immediately at the position of
	 * the cursor, and following this token is the end of the
	 * parse stream.
	 */
	peekThenTerminal(token: string)
	{
		return (
			this._position === this.input.length - token.length &&
			this.input.substr(this._position, token.length) === token);
	}
	
	/**
	 * @returns A boolean value that indicates whether
	 * there are more characters to read in the input.
	 */
	more()
	{
		return this._position < this.input.length;
	}
	
	/**
	 * Gets or sets the position of the cursor from where
	 * reading takes place in the cursor.
	 */
	get position()
	{
		return this._position;
	}
	set position(value: number)
	{
		if (value < 0)
			throw new RangeError();
		
		this._position = value;
	}
	private _position = 0;
	
	/** */
	private readonly input: string;
	
	
	//
	// DEAD
	//
	
	/**
	 * 
	 */
	private atRealBackslash()
	{
		const esc = X.Syntax.escapeChar;
		return this.input.substr(this._position, 2) === esc + esc;
	}
	
	/**
	 * @deprecated
	 * @returns A boolean value that indicates whether an
	 * escape character exists behind the current character.
	 * The algorithm used is respective of sequences of
	 * multiple escape characters.
	 */
	private escaped()
	{
		let escaped = false;
		let backtrackPos = this._position;
		
		while (--backtrackPos >= 0)
			if (this.input[backtrackPos] === X.Syntax.escapeChar)
				escaped = !escaped;
		
		return escaped;
	}
}
