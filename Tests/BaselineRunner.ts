import * as X from "../Core/X";

/*
This module needs to:

- Accept a truth file name, and load it as a string
- Split on newline
- Pass through each line
	- Regex replace "=\s####; ", note the associated statement / pointer error
	- Regex replace "\s~\s*", note the expected inferred types
	- Replace // (virtual) /path/to/file.truth
	
- Call describe()
- Call test(), create any new necessary documents,
- Move the error checking test code
- The ~ notation indicates that the types following the operator are found 
	somewhere in the abstraction hierarchy

Baseline DSL Features:
=====================

*/

export class BaselineRunner
{
	/** */
	private static invoke()
	{
		
	}
}
