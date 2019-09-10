import { System } from "./System";
import { PLABase, TypePrimitive } from "./PLA";
import { Operation, FilterOperation } from "./Operation";
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
	export function is(type: TypePrimitive) 
	{
		return new Operations.IsOperation(type);
	}

	export function not(...operations: Operation[]) 
	{
		return new Operations.NotOperation(operations);
	}

	export function has(...primitives: (FilterOperation | TypePrimitive)[]) 
	{
		const types: TypePrimitive[] = [];
		const operations: FilterOperation[] = [];
		for (const primitive of primitives) 
		{
			if (primitive instanceof FilterOperation) 
			{
				operations.push(primitive);
			}
			else 
			{
				types.push(primitive);
			}
		}
		return new Operations.HasOperation(types, operations);
	}
}
