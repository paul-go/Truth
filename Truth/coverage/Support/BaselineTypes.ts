
namespace Truth
{
	/**
	 * 
	 */
	export class BaselineDocuments
	{
		constructor(
			readonly documents: ReadonlyMap<string, BaselineDocument>,
			readonly graphOutput: string)
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
			readonly baselineLines: readonly BaselineLine[])
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
			readonly line: Line)
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
		descendant = "~ ",
		parseError = "?",
		faultBegin = "#",
		faultEnd = ";",
		fakeFilePathPrefix = "// (fake) ",
		graphOutputPrefix = "// (graph)",
		afterEditPrefix = "// (after edit)"
	}
}
