
namespace Truth
{
	/**
	 * Removes the indentation common to every line in the specified, 
	 * so that Truth source code can be processed as if
	 * there isn't a universal indent applied to every line.
	 */
	export function outdent(literals: TemplateStringsArray, ...placeholders: string[])
	{
		let result = "";
		
		for (let i = -1; ++i < placeholders.length;)
			result += literals[i] + placeholders[i];
		
		result += literals[literals.length - 1];
		const lines = result.split("\n");
		
		// Remove all leading whitespace-only lines.
		while (lines.length && lines[0].trim() === "")
			lines.shift();
		
		// Cut off whitespace-only trailing lines
		while (lines[lines.length - 1].trim() === "")
			lines.pop();
		
		// Find the first non whitespace line with the least amount 
		// of indent, and use it as the universal indent trimmer.
		let minIndent = Number.MAX_SAFE_INTEGER;
		
		for (let i = -1; ++i < lines.length;)
		{
			const line = lines[i];
			if (line.trim() === "")
				continue;
			
			const size = line.length - line.replace(/^\s*/, "").length;
			if (size < minIndent)
				minIndent = size;
		}
		
		// Slice off the left side of the string.
		if (minIndent > 0 && minIndent !== Number.MAX_SAFE_INTEGER)
			for (let i = -1; ++i < lines.length;)
				lines[i] = lines[i].slice(minIndent);
		
		return lines.join("\n");
	}
	
	/**
	 * Tests that a fault extending from the specified Fault constructor
	 * has been reported in the program or document, at the specified
	 * line. If the Fault constructor relates to a SpanFault, an offset
	 * must be specified that refers to the position of the span in the
	 * statement.
	 */
	export function hasFault(
		container: Program | Document,
		faultCode: number,
		line: number,
		offset?: number)
	{
		const program = container instanceof Program ?
			container :
			container.program;
		
		const targetDoc = container instanceof Program ?
			null :
			container;
		
		const isStatementFault = offset === undefined;
		const spanPos = offset || 0;
		
		for (const fault of program.faults.each())
		{
			if (fault.type.code !== faultCode)
				continue;
			
			if (isStatementFault && fault.source instanceof Statement)
				if (!targetDoc || targetDoc === fault.source.document)
					if (fault.source === fault.source.document.read(line))
						return { message: () => "", pass: true };
			
			if (!isStatementFault && fault.source instanceof Span)
				if (!targetDoc || targetDoc === fault.source.statement.document)
					if (fault.source.statement === fault.source.statement.document.read(line))
						if (fault.source.statement.spans.indexOf(fault.source) === spanPos)
							return { message: () => "", pass: true };
		}
		
		const name = Faults.nameOf(faultCode);
		
		return {
			message: isStatementFault ?
				() => `Statement at line ${line} does not have a ${name}.` :
				() => `Span at line ${line}, offset ${offset}) does not have a ${name}.`,
			pass: false
		};
	}
	
	/**
	 * @returns Whether the specified array of statements reads like a 
	 * certain string, when the contents of the statement are concatenated
	 * into lines, and the common indentation in the lines of the specified
	 * string is removed.
	 */
	export function hasContent(statements: Statement[] | null, expected: string)
	{
		if (!Array.isArray(statements))
			return "Expected an array of statement objects, but recieved a non-array.";
		
		if (statements.some(s => !(s instanceof Statement)))
			return "Expected an array of objects who are instanceof Statement.";
		
		const statementStrs = statements.map(smt => smt.toString());
		const expectedStrs = expected.split("\n");
		
		// Remove all leading whitespace-only lines.
		while (expectedStrs.length && expectedStrs[0].trim() === "")
			expectedStrs.shift();
		
		// Cut off whitespace-only trailing lines.
		while (expectedStrs.length && expectedStrs[expectedStrs.length - 1].trim() === "")
			expectedStrs.pop();
		
		// Left-trim whitespace on all lines.
		for (let i = -1; ++i < expectedStrs.length;)
			expectedStrs[i] = expectedStrs[i].replace(/^\s*/, "");
		
		const exp = statementStrs.join("\n");
		const rcv = expectedStrs.join("\n");
		
		if (!statementStrs.every((ss, i) => ss === expectedStrs[i]))
			return `Expected:\n${exp}\nRecieved:${rcv}`;
		
		return true;
	}
}
