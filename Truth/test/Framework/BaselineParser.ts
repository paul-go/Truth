
namespace Truth.Test
{
	/**
	 * 
	 */
	export class BaselineParser
	{
		/** */
		static parse(sourcePath: string, fileContent: string)
		{
			const baselineLines: BaselineLine[] = [];
			const fakeFilePaths = new Map<number, string>();
			const descendantChecks = new MultiMap<number, Line>();
			
			let fileLineIdx = 0;
			let hitGraphMarker = false;
			let lastNonDescendantCheckLineIdx = -1;
			const graphOutputLines: string[] = [];
			
			for (let lineText of LineParser.read(fileContent))
			{
				if (hitGraphMarker)
				{
					graphOutputLines.push(lineText);
					continue;
				}
					
				const checks: Check[] = [];
				const added = lineText[0] === BaselineSyntax.added;
				const removed = lineText[0] === BaselineSyntax.removed;
				const hasParseError = lineText[0] === BaselineSyntax.parseError;
				
				const push = () =>
				{
					baselineLines.push(new BaselineLine(
						added,
						removed,
						hasParseError,
						checks,
						LineParser.parse(lineText)
					));
					
					fileLineIdx++;
				};
				
				if (isLineGraphMarker(lineText))
				{
					hitGraphMarker = true;
					continue;
				}
				
				const fakeFilePath = maybeReadFileMarker(lineText);
				if (fakeFilePath)
				{
					fakeFilePaths.set(fileLineIdx, fakeFilePath);
					push();
					continue;
				}
				
				if (lineText.startsWith(BaselineSyntax.afterEditPrefix))
				{
					push();
					continue;
				}
				
				lineText = added || removed ?
					lineText.slice(1) : 
					lineText;
				
				const descendantCheckLine = maybeExtractDescendantCheck(lineText);
				if (descendantCheckLine === null)
				{
					lastNonDescendantCheckLineIdx = fileLineIdx;
				}
				else
				{
					descendantChecks.add(
						lastNonDescendantCheckLineIdx,
						descendantCheckLine);
					
					lineText = "";
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
				};
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
					.split(Syntax.combinator)
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
				const jnt = Syntax.joint;
				const cmb = Syntax.combinator;
				const dec = BaselineSyntax.descendant;
				
				const matchReg = new RegExp(`^\\s*${dec}(\\w)+[\\w\\s${jnt + cmb}]*$`);
				if (!matchReg.test(lineText))
					return null;
				
				const lineAdjusted = lineText.replace(/~\s*/, "");
				return LineParser.parse(lineAdjusted);
			}
			
			/** */
			function maybeReadFileMarker(lineText: string)
			{
				const prefix = BaselineSyntax.fakeFilePathPrefix;
				return lineText.startsWith(prefix) ?
					lineText.slice(prefix.length) :
					null;
			}
			
			/** */
			function isLineGraphMarker(lineText: string)
			{
				return lineText.startsWith(BaselineSyntax.graphOutputPrefix);
			}
			
			//
			// Mow through the baselineLines array, extract
			// any annotation-side fault checks, and create
			// a new Line object with FaultCheck objects
			// properly organized into a new BaselineLine
			// object.
			//
			function trimAnnotationFaultChecks()
			{
				const fb = BaselineSyntax.faultBegin;
				const fe = BaselineSyntax.faultEnd;
				
				for (let lineIdx = -1; ++lineIdx < baselineLines.length;)
				{
					const baselineLine = baselineLines[lineIdx];
					const innerLine = baselineLine.line;
					const decls = innerLine.declarations;
					const annos = innerLine.annotations;
					let annotationIdx = decls.length - 1;
					
					const reg = new RegExp(`\\s*${fb}\\d+${fe}`, "g");
					
					for (const boundEntry of annos)
					{
						const subjectStr = boundEntry.subject.fullName;
						const matches = subjectStr.match(reg);
						
						if (matches === null)
							continue;
						
						for (const match of matches)
						{
							const faultCode = parseInt(match.replace(fb, "").replace(fe, ""), 10);
							baselineLine.checks.push(new FaultCheck(
								annotationIdx,
								faultCode));
						}
						
						annotationIdx++;
					}
					
					const newSourceText = innerLine.sourceText.replace(reg, "");
					
					baselineLines[lineIdx] = new BaselineLine(
						baselineLine.wasAdded,
						baselineLine.wasRemoved,
						baselineLine.hasParseError,
						baselineLine.checks,
						LineParser.parse(newSourceText));
				}
			}
			
			trimAnnotationFaultChecks();
			
			//
			// Update the baselineLines array so that descendant checks
			// are properly positioned as DescendantCheck instances 
			// beneath a BaselineLine, rather than BaselineLines themselves.
			//
			
			for (const [hostLineIdx, descendantCheckLines] of descendantChecks.entries())
			{
				const baselineLine = baselineLines[hostLineIdx];
				const checks: DescendantCheck[] = [];
				
				for (const [chkLineIdx, descendantCheckLine] of descendantCheckLines.entries())
				{
					const ancestry: Line[] = [descendantCheckLine];
					
					// Backtrack up the baselineLines array, find the full ancestry
					// of the descendantLine, and compute it's path. Note that
					// this process doesn't need to support fragmented types,
					// because these are not allowed in baselines (at least as
					// containers of descendant checks).
					for (let backtrackLineIdx = chkLineIdx; backtrackLineIdx-- > 0;)
					{
						const ancestor = baselineLines[backtrackLineIdx].line;
						const flags = 
							LineFlags.isComment | 
							LineFlags.isCruft | 
							LineFlags.isWhitespace;
						
						if ((ancestor.flags ^ flags) !== ancestor.flags)
							continue;
						
						if (ancestor.indent >= ancestry[0].indent)
							continue;
						
						if (ancestor.declarations.length !== 1)
							throw new Error("Descendant check has fragmented ancestry.");
								
						ancestry.unshift(ancestor);
						
						if (ancestor.indent === 0)
							break;
					}
					
					const path = ancestry.map(line =>
					{
						const value = line.declarations.first();
						if (value === null)
							throw Exception.unknownState();
						
						return value instanceof Pattern ?
							escape(value.toString()) :
							value.toString();
					});
					
					const annotations = Array
						.from(descendantCheckLine.annotations)
						.map(boundsEntry => boundsEntry.subject)
						.filter((a): a is Identifier => a !== null)
						.map(ident => ident.toString());
					
					checks.push(new DescendantCheck(path, annotations));
					baselineLine.checks.push(...checks);
				}
			}
			
			// 
			// Split the baseline up into two parts: the first being the
			// "before", which means "before the edit transaction took
			// place", and the second being "after the edit transaction
			// took place".
			// 
			
			//
			// Generate a proper BaselineProgram where the faults
			// that are generated can be easily lined up.
			//
			
			//
			// Note that if there are multiple files ("fake files") specified
			// in a baseline, the lines before the first fake file definition
			// are ignored.
			//
			
			const baselineDocuments = new Map<string, BaselineDocument>();
			const documentLines: BaselineLine[] = [];
			
			const storeBaselineDocument = (path: string) =>
			{
				const rawDocumentText = documentLines
					.map(docLine => docLine.line.sourceText)
					.join(Syntax.terminal);
				
				const baselineDocument = new BaselineDocument(
					path,
					rawDocumentText,
					Object.freeze(documentLines.slice()));
				
				baselineDocuments.set(path, baselineDocument);
			};
			
			for (let lineIdx = baselineLines.length; lineIdx-- > 0;)
			{
				const fakeFilePath = fakeFilePaths.get(lineIdx);
				if (fakeFilePath)
				{
					storeBaselineDocument(fakeFilePath);
					documentLines.length = 0;
				}
				else
				{
					const src = baselineLines[lineIdx].line.sourceText;
					documentLines.unshift(baselineLines[lineIdx]);
				}
			}
			
			storeBaselineDocument(sourcePath);
			return new BaselineDocuments(
				baselineDocuments,
				graphOutputLines.join("\n").trim());
		}
	}
}
