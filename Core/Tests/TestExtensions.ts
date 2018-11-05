import * as X from "../X";


/**
 * Applies specific extensions to the expect function
 * provided by Jest. Typings for these extensions are 
 * defined in the root Types folder.
 */
expect.extend({
	
	/**
	 * (Documentation in TestExtensions.d.ts)
	 */
	toRead(actual: X.Statement[], expected: string)
	{
		const fail = (message: string) => ({
			message: () => message,
			pass: false
		});
		
		if (!Array.isArray(actual))
			return fail(`Expected an array of statement objects, but recieved a non-array.`);
		
		if (actual.some(s => !(s instanceof X.Statement)))
			return fail(`Expected an array of objects who are instanceof Statement.`);
		
		const statementStrs = actual.map(stmt => stmt.toString());
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
			return fail(`Expected:\n${exp}\nRecieved:${rcv}`);
		
		return {
			message: () => ``,
			pass: true
		}
	},
	
	/**
	 * (Documentation in TestExtensions.d.ts)
	 */
	toHaveFault(
		container: X.Program | X.Document,
		faultType: Function,
		line: number,
		offset?: number)
	{
		const program = container instanceof X.Program ?
			container :
			container.program;
		
		const targetDoc = container instanceof X.Program ?
			null :
			container;
		
		const isStatementFault = offset === undefined;
		const pointerPos = offset || 0;
		
		for (const fault of program.faults.each())
		{
			if (!(fault instanceof faultType))
				continue;
			
			if (isStatementFault && fault instanceof X.StatementFault)
				if (!targetDoc || targetDoc === fault.source.document)
					if (fault.source === fault.source.document.read(line))
						return { message: () => "", pass: true };
			
			if (!isStatementFault && fault instanceof X.PointerFault)
				if (!targetDoc || targetDoc === fault.source.statement.document)
					if (fault.source.statement === fault.source.statement.document.read(line))
						if (fault.source.statement.subjects.indexOf(fault.source) === pointerPos)
							return { message: () => "", pass: true };
		}
		
		const ctor = faultType.name;
		
		return {
			message: isStatementFault ?
				() => `Statement at line ${line} does not have a ${ctor}.` :
				() => `Pointer at line ${line}, offset ${offset}) does not have a ${ctor}.`,
			pass: false
		};
	}
});
