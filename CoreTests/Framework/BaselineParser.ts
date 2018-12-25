import * as X from "../X";


/**
 * 
 */
export class BaselineParser
{
	/** */
	static parse(fileContent: string)
	{
		const baselineLines: BaselineLine[] = [];
		const descendentCheckLines = new Set<number>();
		const fakeFilePaths = new Map<number, string>();
		
		let fileLineIdx = 0;
		let fakeEditTransactionSplitPoint = -1;
		
		for (let lineText of X.LineParser.read(fileContent))
		{
			const checks: Check[] = [];
			const added = lineText[0] === BaselineSyntax.added;
			const removed = lineText[0] === BaselineSyntax.removed;
			const hasParseError = lineText[0] === BaselineSyntax.parseError;
			
			lineText = added || removed ?
				lineText.slice(1) : 
				lineText;
			
			const fakeFilePath = maybeReadFileMarker(lineText);
			if (fakeFilePath)
			{
				fakeFilePaths.set(fileLineIdx, fakeFilePath);
				push();
				continue;
			}
			
			if (lineText.startsWith(BaselineSyntax.afterEditPrefix))
			{
				fakeEditTransactionSplitPoint = fileLineIdx;
				push();
				continue;
			}
			
			const lineTextExtracted = maybeExtractDescendantCheck(lineText);
			if (lineTextExtracted)
			{
				lineText = lineTextExtracted;
				descendentCheckLines.add(fileLineIdx);
				push();
				continue;
			}
			
			const extractedFaultInfo = maybeExtractDeclarationFault(lineText);
			if (extractedFaultInfo)
			{
				checks.push(new FaultCheck(0, extractedFaultInfo.faultCode));
				lineText = extractedFaultInfo.newLineText;
			}
			
			const extractedInferenceInfo = maybeExtractInferences(lineText);
			if (extractedInferenceInfo)
			{
				checks.push(...extractedInferenceInfo.inferences);
				lineText = extractedInferenceInfo.newLineText;
			}
			
			push();
			
			function push()
			{
				baselineLines.push(new BaselineLine(
					added,
					removed,
					hasParseError,
					checks,
					X.LineParser.parse(lineText)
				));
				
				fileLineIdx++;
			}
		}
		
		/**
		 * Extracts any declaration fault located at the beginning of the line.
		 * (Baselines only support a single declaration fault, which must be
		 * printed in this location.)
		 */
		function maybeExtractDeclarationFault(lineText: string)
		{
			const pe = BaselineSyntax.parseError;
			const fe = BaselineSyntax.faultEnd;
			const reg = `^\\s*${pe}(\\d{3,5})${fe} `;
			const match = new RegExp(reg).exec(lineText);
			if (!match)
				return null;
			
			const faultCode = parseInt(match[0], 10);
			
			return {
				faultCode,
				newLineText: lineText.replace(pe + faultCode + fe + " ", "")
			}
		}
		
		/**
		 * Extracts inference checks from the line, that come in the form:
		 * Declaration : Annotation1, Annotation2 ~ Annotation2
		 */
		function maybeExtractInferences(lineText: string)
		{
			const infIdx = lineText.lastIndexOf(BaselineSyntax.inference);
			if (infIdx < 0)
				return null;
			
			const lhs = lineText.slice(0, infIdx);
			const rhs = lineText.slice(infIdx + BaselineSyntax.inference.length);
			const neg = BaselineSyntax.inferenceNegation;
			const inferences = rhs
				.split(X.Syntax.combinator)
				.map(s => s.trim())
				.filter(s => !!s)
				.map(s =>
				{
					const hasNegation = s[0] === neg;
					return new InferenceCheck(
						hasNegation ? s.slice(neg.length) : s,
						hasNegation);
				});
			
			return {
				inferences,
				newLineText: lhs
			};
		}
		
		/** */
		function maybeExtractDescendantCheck(lineText: string)
		{
			const reg = new RegExp(`(^\s*)(${BaselineSyntax.descendent}\s+)(.+)`);
			return reg.test(lineText) ?
				lineText.replace(reg, "$1$3") :
				"";
		}
		
		/** */
		function maybeReadFileMarker(lineText: string)
		{
			return lineText.startsWith(BaselineSyntax.fakeFilePathPrefix) ?
				lineText.slice(BaselineSyntax.fakeFilePathPrefix.length) :
				null;
		}
		
		//
		// Mow through the baselineLines array, extract
		// any annotation-side fault checks, and create
		// a new Line object with FaultCheck objects
		// properly organized into a new BaselineLine
		// object.
		//
		
		for (let lineIdx = -1; ++lineIdx < baselineLines.length;)
		{
			const baselineLine = baselineLines[lineIdx];
			const innerLine = baselineLine.line;
			const sourceTextExtractionRanges: [number, number][] = [];
			let annotationIdx = innerLine.declarations.size - 1;
			
			for (const [position, identifier] of innerLine.annotations)
			{
				annotationIdx++;
				
				if (identifier === null)
					continue;
				
				if (!identifier.value.endsWith(BaselineSyntax.faultEnd))
					continue;
				
				const val = identifier.value;
				const hashIdx = val.lastIndexOf(BaselineSyntax.faultBegin);
				
				if (hashIdx < 0)
					continue;
				
				const faultCode = parseInt(val.slice(hashIdx + 1, -1), 10);
				sourceTextExtractionRanges.push([position + hashIdx, val.length - hashIdx]);
				
				baselineLine.checks.push(new FaultCheck(
					annotationIdx,
					faultCode));
			}
			
			let newSourceText = innerLine.sourceText;
			
			for (let rangeIdx = sourceTextExtractionRanges.length; rangeIdx-- > 0;)
			{
				const [from, to] = sourceTextExtractionRanges[rangeIdx];
				newSourceText = from === 0 ?
					newSourceText.slice(to + 1) :
					newSourceText.slice(0, from - 1) + newSourceText.slice(to + 1);
			}
			
			baselineLines[lineIdx] = new BaselineLine(
				baselineLine.wasAdded,
				baselineLine.wasRemoved,
				baselineLine.hasParseError,
				baselineLine.checks,
				X.LineParser.parse(newSourceText));
		}
		
		//
		// Update the baselineLines array so that descendant checks
		// are properly positioned as DescendantCheck instances 
		// beneath a BaselineLine, rather than BaselineLines themselves.
		//
		
		for (let lineIdx = -1; ++lineIdx < baselineLines.length;)
		{
			const baselineLine = baselineLines[lineIdx];
			const hasDescendentCheck = descendentCheckLines.has(lineIdx + 1);
			if (hasDescendentCheck)
				continue;
			
			const checks: DescendantCheck[] = [];
			
			while (++lineIdx < baselineLines.length)
			{
				const descendantLine = baselineLines[lineIdx].line;
				const ancestry: X.Line[] = [descendantLine];
				
				// Backtrack up the baselineLines array, find the full ancestry
				// of the descendantLine, and compute it's path. Note that
				// this process doesn't need to support fragmented types,
				// because these are not allowed in baselines (at least as
				// containers of descendant checks).
				for (let backtrackLineIdx = lineIdx; backtrackLineIdx-- > 0;)
				{
					const ancestor = baselineLines[backtrackLineIdx].line;
					const flags = 
						X.LineFlags.isComment | 
						X.LineFlags.isUnparsable | 
						X.LineFlags.isWhitespace;
					
					if ((ancestor.flags & flags) !== ancestor.flags)
						continue;
					
					if (ancestor.indent >= ancestry[0].indent)
						continue;
					
					if (ancestor.declarations.size !== 1)
						throw new Error("Descendant check has fragmented ancestry.");
							
					ancestry.unshift(ancestor);
					
					if (ancestor.indent === 0)
						break;
				}
				
				const path = ancestry.map(line =>
				{
					const value = line.declarations.values().next().value;
					if (value === null)
						throw X.ExceptionMessage.unknownState();
					
					return value instanceof X.Pattern ?
						encodeURIComponent(value.toString()) :
						value.toString();
				});
				
				const annotations = Array
					.from(descendantLine.annotations.values())
					.filter((a): a is X.Identifier => a !== null)
					.map(ident => ident.toString());
				
				checks.push(new DescendantCheck(path, annotations));
				
				// Reset the baselineLine to an empty line, so that
				// it doesn't show up when the lines are converted
				// into a real document.
				baselineLines[lineIdx] = new BaselineLine(
					false,
					false,
					false,
					[],
					X.LineParser.parse(""));
			}
			
			baselineLine.checks.push(...checks);
		}
		
		// 
		// Split the baseline up into two parts: the first being the "before",
		// which means "before the edit transaction took place", and the
		// second being "after". The BaselineRunner will 
		// 
		
		//
		// Generate a proper BaselineProgram where the faults
		// that are generated can be easily lined up.
		//
		
		
		// Note that if there are multiple files ("fake files") specified
		// in a baseline, the lines before the first fake file definition
		// are ignored.
		
		const baselineDocuments = new Map<string, BaselineDocument>();
		const documentLines: BaselineLine[] = [];
		
		for (const [baselineLineIdx, baselineLine] of baselineLines.entries())
		{
			const fakeFilePath = fakeFilePaths.get(baselineLineIdx);
			if (fakeFilePath)
			{
				const rawDocumentText = documentLines
					.map(baselineLine => baselineLine.line.sourceText)
					.join(X.Syntax.terminal);
				
				const baselineDocument = new BaselineDocument(
					fakeFilePath,
					rawDocumentText,
					Object.freeze(documentLines.slice()));
				
				baselineDocuments.set(fakeFilePath, baselineDocument);
				documentLines.length = 0;
			}
			else
			{
				documentLines.push(baselineLine);
			}
		}
		
		return new BaselineProgram(baselineDocuments);
	}
}

/**
 * 
 */
export class BaselineProgram
{
	constructor(
		readonly documents: ReadonlyMap<string, BaselineDocument>)
	{ }
}


/**
 * 
 */
export class BaselineDocument
{
	constructor(
		readonly fakeUri: string,
		readonly sourceText: string,
		readonly baselineLines: ReadonlyArray<BaselineLine>)
	{ }
}


/**
 * 
 */
export class BaselineLine
{
	constructor(
		readonly wasAdded: boolean,
		readonly wasRemoved: boolean,
		readonly hasParseError: boolean,
		readonly checks: Check[],
		readonly line: X.Line)
	{ }
}


/**
 * Stores the faults that are applied to specific subjects in a statement.
 * If the subjectIndex is 0, this indicates that the fault generated relates
 * to the first (and only) declaration in the statement. (It can also be
 * assumed that this fault would be a StatementFault.)
 */
export class FaultCheck
{
	constructor(
		readonly spanIndex: number,
		readonly faultCode: number)
	{ }
}

/** */
export class InferenceCheck
{
	constructor(
		readonly typeName: string,
		readonly isPositive: boolean)
	{ }
}

/** */
export class DescendantCheck
{
	constructor(
		readonly path: string[],
		readonly annotations: string[])
	{ }
}

/** */
export type Check = FaultCheck | InferenceCheck | DescendantCheck;


/**
 * 
 */
export const enum BaselineSyntax
{
	added = "+",
	removed = "-",
	inference = " ~ ",
	inferenceNegation = "!",
	descendent = "~ ",
	parseError = "?",
	faultBegin = "#",
	faultEnd = ";",
	fakeFilePathPrefix = "// (fake) ",
	afterEditPrefix = "// (after edit)"
}
