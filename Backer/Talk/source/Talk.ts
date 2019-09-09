import { System } from "./System";
import { PLABase } from "./PLA";
import { Operation } from "./Operation";
import * as Operations from "./Operations";
import * as Truth from "truth-compiler";

export function tt(...primitives: (PLABase | Operation)[]) 
{
	const query = System.this.query();

	for (const primitive of primitives) 
	{
		query.addOperation(
			primitive instanceof Operation ? primitive : tt.is(primitive)
		);
	}

	return query.run();
}

export namespace tt {
	export function is(type: Truth.Type | PLABase) 
	{
		return new Operations.IsOperation(type);
	}

	export function not(...operations: Operation[]) 
	{
		return new Operations.NotOperation(operations);
	}
}
