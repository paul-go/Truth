
namespace Truth
{
	/**
	 * Stores information about a line, after being parsed.
	 * A Line is different from a Statement in that it has no
	 * relationship to a Document.
	 */
	export class Line
	{
		/*** */
		constructor(
			readonly sourceText: string,
			readonly indent: number,
			readonly declarations: BoundaryGroup<Subject>,
			readonly annotations: BoundaryGroup<Term>,
			readonly sum: string,
			readonly jointPosition: number,
			readonly flags: StatementFlags,
			readonly faultType: StatementFaultType | null)
		{ }
	}
}
