import * as X from "./X";
import * as Truth from "truth-compiler";

export function tt(...primitives: (X.PLABase | X.Operation)[]) 
{
	const query = X.System.this.query();

	for (const primitive of primitives) 
	{
		query.addOperation(
			primitive instanceof X.Operation ? primitive : tt.is(primitive)
		);
	}

	return query.run();
}

export namespace tt {
	export function is(type: X.TypePrimitive) 
	{
		return new X.IsOperation(type);
	}

	export function not(...operations: X.Operation[]) 
	{
		return new X.NotOperation(operations);
	}

	export function has(...primitives: (X.FilterOperation | X.TypePrimitive)[]) 
	{
		const types: X.TypePrimitive[] = [];
		const operations: X.FilterOperation[] = [];
		for (const primitive of primitives) 
		{
			if (primitive instanceof X.FilterOperation) 
			{
				operations.push(primitive);
			}
			else 
			{
				types.push(primitive);
			}
		}
		return new X.HasOperation(types, operations);
	}

	export function greaterThan(value: string | number) 
	{
		return new X.GreaterThanOperation(value);
	}

	export function lessThan(value: string | number) 
	{
		return new X.LessThanOperation(value);
	}
}
