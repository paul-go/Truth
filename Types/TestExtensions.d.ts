
declare namespace jest
{
	interface Matchers<R>
	{
		/**
		 * Tests that an array of statements reads like a certain string,
		 * when the contents of the statement are concatenated into
		 * lines, and the common indentation in the lines of the specified
		 * string is removed.
		 */
		toRead(expected: string): R;
		
		/**
		 * Tests that a fault extending from the specified Fault constructor
		 * has been reported in the program or document, at the specified
		 * line. If the Fault constructor relates to a PointerFault, an offset
		 * must be specified that refers to the position of the pointer in the
		 * statement.
		 */
		toHaveFault(faultType: Function, line: number, offset?: number): R;
	}
}
