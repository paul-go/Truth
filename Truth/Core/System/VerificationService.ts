import * as X from "../X";


/**
 * @internal
 * A service that watches the edit cycle on the document,
 * performs on-the-fly verification, and reports any faults
 * discovered. Used when the host Program instance has
 * autoCompile set to true.
 */
export class VerificationService
{
	/** */
	constructor(program: X.Program)
	{
		program.hooks.Revalidate.capture(hook =>
		{
			for (const statement of hook.parents)
				if (!statement.isCruft)
					for (const declaration of statement.declarations)
						declaration.factor().map(spine => 
							X.Type.construct(spine, program));
		});
	}
}
