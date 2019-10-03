
namespace make
{
	const sourceMapPrefix = ["\n", "//", "#", " source", "MappingURL="].join("");
	const sourceMapContentSep = ";base64,";
	
	/**
	 * Concatenates JavaScript files into a single file. Source maps are omitted.
	 * The last file specified is the save target. If the file already exists, it's overritten.
	 */
	export function concatUnmapped(...filePaths: string[])
	{
		// Concatenation doesn't make any sense if less
		// than 2 files have been specified.
		if (filePaths.length < 2)
			return;
		
		const output: string[] = [];
		const outPath = filePaths[filePaths.length - 1];
		
		for (const filePath of filePaths)
		{
			const fileText = Fs.readFileSync(filePath).toString();
			const sourceMapCommentPos = fileText.lastIndexOf(sourceMapPrefix);
			
			if (sourceMapCommentPos < 0)
				output.push(fileText);
			else
				output.push(fileText.slice(0, sourceMapCommentPos));
		}
		
		Fs.writeFileSync(outPath, output.join("\n"));
	}
	
	/**
	 * Concat JavaScript files into a single file. If any of the input JavaScript
	 * files have inline source maps, the source maps are also concatenated
	 * into a single inline source map comment.
	 * 
	 * The last file specified is the save target. If the file already exists, it's overritten.
	 */
	export function concat(...filePaths: string[])
	{
		// Concatenation doesn't make any sense if less
		// than 2 files have been specified.
		if (filePaths.length < 3)
			return;
		
		const paths = filePaths.slice();
		const outPath = paths.pop()!;
		const outPathParsed = Path.parse(outPath);
		const outPathDir = Path.resolve(outPathParsed.dir);
		
		const sourceTextBlocks: string[] = [];
		const sources: string[] = [];
		const names: string[] = [];
		const mappings: number[][][] = [];
		const sourcesContent: string[] = [];
		
		/**
		 * Adds a block of code to the bundle that doesn't have
		 * any corresponding source mapping information.
		 */
		function addUnmappedBlock(sourceText: string)
		{
			let lineCount = 1;
			
			for (let i = -1; ++i < sourceText.length;)
				if (sourceText[i] === "\n")
					lineCount++;
			
			for (let i = -1; ++i < lineCount;)
				mappings.push(<any>-lineCount);
			
			sourceTextBlocks.push(sourceText);
		}
		
		for (let inFilePathIdx = -1; ++inFilePathIdx < paths.length;)
		{
			const inFilePath = paths[inFilePathIdx];
			
			if (!inFilePath.endsWith(".js"))
				continue;
			
			if (!Fs.existsSync(inFilePath))
				continue;
			
			const fileText = Fs.readFileSync(inFilePath).toString();
			
			const sourceMapCommentPos = fileText.lastIndexOf(sourceMapPrefix);
			if (sourceMapCommentPos < 0)
			{
				addUnmappedBlock(fileText);
				continue;
			}
			
			const sourceText = fileText.slice(0, sourceMapCommentPos);
			const sourceMapContentStart = fileText.indexOf(
				sourceMapContentSep,
				sourceMapCommentPos);
			
			// Unsupported source map format
			if (sourceMapContentStart < 0)
			{
				addUnmappedBlock(sourceText);
				continue;
			}
			
			const sourceMapRaw = fileText.slice(
				sourceMapContentStart + sourceMapContentSep.length);
			
			const sourceMapDecoded = fromBase64(sourceMapRaw);
			const sourceMapParsed: ISourceMap = JSON.parse(sourceMapDecoded);
			sourceTextBlocks.push(sourceText);
			
			// Add a decoded version of the "mappings" entry
			mappings.push(...decodeVLQLines(sourceMapParsed.mappings));
			
			// Add an empty array between each input .js file, which will be
			// used as a marker to determine when we're switching between
			// them.
			mappings.push([]);
			
			// Adjust the "sources" entry
			if (sourceMapParsed.sources)
			{
				const inFileDir = Path.parse(inFilePath).dir;
				const inFileDirAbsolute = Path.resolve(inFileDir);
				const sourcesAdjusted = sourceMapParsed.sources
					.map(path => Path.resolve(inFileDirAbsolute, path))
					.map(path => Path.relative(outPathDir, path));
				
				sources.push(...sourcesAdjusted);
			}
			
			if (sourceMapParsed.names)
				names.push(...sourceMapParsed.names);
			
			if (sourceMapParsed.sourcesContent)
				sourcesContent.push(...sourceMapParsed.sourcesContent);
		}
		
		// Adjust the mappings entry
		{
			let lineCursor = 0;
			let lineCursorShift = 0;
			let mustAdjustForNewFile = false;
			
			for (let mappingIdx = 0; mappingIdx < mappings.length;)
			{
				if (mappings[mappingIdx].length === 0)
				{
					mappings.splice(mappingIdx, 1);
					mustAdjustForNewFile = true;
					
					if (mappingIdx >= mappings.length)
						break;
				}
				
				while (typeof mappings[mappingIdx] === "number")
				{
					lineCursorShift += <any>mappings[mappingIdx].valueOf();
					mappings.splice(mappingIdx, 1);
				}
				
				const mapping = mappings[mappingIdx];
				for (const segment of mapping)
				{
					if (segment.length >= 4)
					{
						lineCursor += segment[2];
						
						if (lineCursorShift !== 0)
						{
							segment[2] += lineCursorShift;
							lineCursorShift = 0;
						}
						
						if (mustAdjustForNewFile)
						{
							segment[1]++;
							segment[2] -= lineCursor;
							lineCursor = 0;
							mustAdjustForNewFile = false;
						}
					}
				}
				
				mappingIdx++;
			}
		}
		
		const source = sourceTextBlocks.join("\n");
		const sourceMap: ISourceMap = {
			version: 3,
			file: Path.parse(outPath).base,
			sourceRoot: "",
			sources,
			names,
			mappings: encodeVLQLines(mappings),
			sourcesContent
		};
		
		const sourceMapText = JSON.stringify(sourceMap);
		const sourceMapEncoded = toBase64(sourceMapText);
		const sourceMapComment =
			sourceMapPrefix + 
			"data:application/json;base64," +
			sourceMapEncoded;
		
		const fileContent = source + sourceMapComment;
		
		if (Fs.existsSync(outPath))
			Fs.unlinkSync(outPath);
		
		Fs.writeFileSync(outPath, fileContent);
	}
	
	/** */
	function toBase64(plain: string)
	{
		return Buffer.from(plain, "utf8").toString("base64");
	}
	
	/** */
	function fromBase64(encoded: string)
	{
		return Buffer.from(encoded, "base64").toString("utf8");
	}
	
	/**
	 * A simple type definition for a V3 source map object.
	 */
	interface ISourceMap
	{
		version: 3;
		file?: string;
		sourceRoot?: string;
		sources?: string[];
		names?: string[];
		mappings: string;
		sourcesContent?: string[];
	}
	
	//# Source map VLQ tools, 
	//# Lifted from: https://github.com/Rich-Harris/vlq/blob/master/src/vlq.ts
	
	const charToInteger: { [char: string]: number } = {};
	const integerToChar: { [integer: number]: string } = {};

	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".split("").forEach((char, i) =>
	{
		charToInteger[char] = i;
		integerToChar[i] = char;
	});
	
	/** */
	function decodeVLQLines(vlqLines: string): number[][][]
	{
		return vlqLines.split(";").map(line => decodeVLQLine(line));
	}
	
	/** */
	function decodeVLQLine(vlqLine: string): number[][]
	{
		return vlqLine.split(",").map(segment => decodeVLQ(segment));
	}
	
	/** */
	function decodeVLQ(string: string): number[]
	{
		const result: number[] = [];
		let shift = 0;
		let value = 0;

		for (let i = 0; i < string.length; i++)
		{
			let integer = charToInteger[string[i]];
			
			if (integer === undefined)
				throw new Error(`Invalid character ("${string[i]}")`);
			
			const hasContinuationBit = integer & 32;

			integer &= 31;
			value += integer << shift;

			if (hasContinuationBit)
			{
				shift += 5;
			}
			else
			{
				const shouldNegate = value & 1;
				value >>= 1;
				result.push(shouldNegate ? -value : value);
				// reset
				value = 0;
				shift = 0;
			}
		}

		return result;
	}
	
	/** */
	function encodeVLQLines(value: number[][][])
	{
		return value.map(v => encodeVLQLine(v)).join(";");
	}
	
	/** */
	function encodeVLQLine(value: number[][])
	{
		return value.map(v => encodeVLQ(v)).join(",");
	}
	
	/** */
	function encodeVLQ(value: number | number[]): string
	{
		let result: string;
		
		if (typeof value === "number")
		{
			result = encodeInteger(value);
		}
		else
		{
			result = "";
			for (let i = 0; i < value.length; i++)
				result += encodeInteger(value[i]);
		}

		return result;
	}
	
	/** */
	function encodeInteger(num: number): string
	{
		let result = "";
		let n = num;
		
		if (n < 0)
			n = -n << 1 | 1;
		else
			n <<= 1;
		
		do
		{
			let clamped = n & 31;
			n >>= 5;

			if (n > 0)
				clamped |= 32;
			
			result += integerToChar[clamped];
		}
		while (n > 0);
		
		return result;
	}
	
	/** */
	function debugVLQLines(vlqLines: string)
	{
		const lines = decodeVLQLines(vlqLines);
		
		for (let x = -1; ++x < lines.length;)
		{
			console.log("[");
			for (let y = -1; ++y < lines[x].length;)
			{
				console.log("\t[" + lines[x][y].join(", ") + "]");
			}
			console.log("]");
		}
	}
}
