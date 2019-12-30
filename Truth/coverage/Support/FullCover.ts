
namespace Truth
{
	/**
	 * A fixture for a cover function that captures the behavior of loading
	 * a Truth document, and verifying whether it was loaded properly.
	 */
	export class FullCover
	{
		/** */
		constructor()
		{
			this.program = new Program();
		}
		
		/**
		 * Gets the Truth Program instance within which the 
		 * Truth code relating to the cover is processed.
		 */
		readonly program: Truth.Program;
		
		/** */
		private readonly documents = new Map<string, BaselineDocument>();
		
		/**
		 * Adds a virtual file with the specified source content.
		 * @returns The virtual URI specified.
		 */
		add(sourceText: string)
		{
			const virtualPath = this.createVirtualPath();
			this.addDocument(outdent`${sourceText}`, virtualPath);
			return virtualPath;
		}
		
		/** */
		createVirtualPath()
		{
			return `file://this/is/fake/${++this.uriCount}.truth`;
		}
		
		/** */
		private uriCount = 0;
		
		/**
		 * Makes a change to the virtual file with the specified URI, at the
		 * specified line number. The line number is the line counting from
		 * the first non-whitespace line in the virtual file.
		 * 
		 * The operation works by finding the first occurence of the substring
		 * specified in the "find" argument, and replacing it with the string
		 * specified in the "replace" argument.
		 */
		edit(fakeFileUri: string, lineNumber: number, find: string, replace: string)
		{
			
		}
		
		/** */
		async try(sourceText?: string)
		{
			if (sourceText)
				this.add(sourceText);
			
			const execResult = await this.execute();
			return execResult;
		}
		
		/**
		 * Parses a document at the specified virtual path, with the
		 * specified sourceText. After parsing, the document is added
		 * to the local documents map.
		 */
		private addDocument(sourceText: string, virtualPath: string)
		{
			const baselineLines: BaselineLine[] = [];
			const descendantChecks = new MultiMap<number, Line>();
			
			let fileLineIdx = 0;
			let hitGraphMarker = false;
			let lastNonDescendantCheckLineIdx = -1;
			const graphOutputLines: string[] = [];
			
			for (let lineText of LineParser.read(sourceText))
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
			
			const rawDocumentText = baselineLines
				.map(docLine => docLine.line.sourceText)
				.join(Syntax.terminal);
			
			const baselineDocument = new BaselineDocument(
				rawDocumentText,
				Object.freeze(baselineLines.slice()));
			
			this.documents.set(virtualPath, baselineDocument);
		}
		
		/**
		 * 
		 */
		private async execute()
		{
			const reports: Report[] = [];
			
			// Errors need to be blocked from checking while
			// the program is populated with content.
			
			for await (const [virtualPath, baselineDoc] of this.documents)
			{
				const virtualUri = Uri.tryParse(virtualPath);
				if (!virtualUri)
					throw new Error("Invalid URI: " + virtualPath);
				
				const doc = await this.program.addDocument(baselineDoc.sourceText);
				if (doc instanceof Error)
					return doc;
				
				doc.updateUri(virtualUri);
			}
			
			const result = this.program.verify();
			
			// Go through all BaselineDocument instances, and make sure that 
			// faults are reported (and not reported) in the locations as specified
			// by the BaselineDocument's checks.
			
			for (const [fakeUriText, baselineDoc] of this.documents)
			{
				const fakeUri = Not.null(Uri.tryParse(fakeUriText));
				const realDoc = Not.null(this.program.getDocumentByUri(fakeUri));
				
				for (const [docLineIdx, baselineLine] of baselineDoc.baselineLines.entries())
				{
					const statement = realDoc.read(docLineIdx);
					const faultsGenerated = this.program.faults.checkAll(statement);
					const checks = baselineLine.checks;
					
					const faultChecks = checks.filter((chk): chk is FaultCheck => 
						chk instanceof FaultCheck);
					
					const inferenceChecks = checks.filter((chk): chk is InferenceCheck =>
						chk instanceof InferenceCheck);
					
					const descendantChecks = checks.filter((chk): chk is DescendantCheck =>
						chk instanceof DescendantCheck);
					
					if (faultChecks.length > 0 || faultsGenerated.length > 0)
					{
						const expected: string[] = [];
						const received: string[] = [];
						
						for (const [spanIdx, span] of statement.spans.entries())
						{
							const checks = faultChecks.filter(chk => chk.spanIndex === spanIdx);
							const expCodes = checks.map(chk => chk.faultCode);
							const expNames = expCodes.map(code => Faults.nameOf(code));
							expected.push(this.serializeSpan(span, expCodes, expNames));
							
							const recFaults = this.program.faults.check(span);
							const recCodes = recFaults.map(f => f.type.code);
							const recNames = recCodes.map(code => Faults.nameOf(code));
							received.push(this.serializeSpan(span, recCodes, recNames));
						}
						
						const splitter = "   ";
						const expectedSerialized = expected.join(splitter);
						const receivedSerialized = received.join(splitter);
						
						if (expectedSerialized !== receivedSerialized)
						{
							reports.push(new Report(
								docLineIdx + 1,
								baselineLine.line.sourceText,
								[
									"Expected faults: " + expectedSerialized,
									"Received faults: " + receivedSerialized
								]));
						}
					}
					
					//! TODO: Handle inference checks
					//! TODO: Handle descendent checks
				}
			}
			
			const reportStrings: string[] = [];
			
			for (const report of reports)
			{
				const reportLines = [
					"Line: " + report.documentLineNumber,
					"Source: " + report.lineSource,
					...report.messages
				];
				
				reportStrings.push(reportLines.join("\n"));
			}
			
			return reportStrings;
		}
		
		/**
		 * 
		 */
		private serializeSpan(span: Span, codes: number[], names: string[])
		{
			const parts = [span.toString()];
			
			if (codes.length !== names.length)
				throw Exception.unknownState();
			
			if (codes.length > 0)
			{
				for (const [i, code] of codes.entries())
				{
					parts.push(BaselineSyntax.faultBegin + code + BaselineSyntax.faultEnd);
					parts.push("(" + names[i] + ")");
				}
			}
			else
			{
				parts.push("(none)");
			}
			
			return parts.join(" ");
		}
	}
	
	/** */
	class Report
	{
		constructor(
			readonly documentLineNumber: number,
			readonly lineSource: string,
			readonly messages: string[])
		{ }
	}
}
