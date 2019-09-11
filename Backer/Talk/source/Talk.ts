import * as X from "./X";
import * as Truth from "truth-compiler";

export function tt(...primitives: (X.PLABase | X.Operation)[]) 
{
	const query = X.System.this.query();

	for (const primitive of primitives) 
	{
		query.attach(
			primitive instanceof X.Operation ? primitive : tt.is(primitive)
		);
	}

	return query.run();
}

export namespace tt {
	export function is(type: X.TypePrimitive) 
	{
		const operation = new X.IsOperation();
		operation.attach(type);
		return operation;
	}

	export function not(...operations: X.Operation[]) 
	{
		const operation = new X.NotOperation();
		for (const o of operations) operation.attach(o);
		return operation;
	}

	export function has(...primitives: (X.FilterOperation | X.TypePrimitive)[]) 
	{
		const operation = new X.HasOperation();
		for (const p of primitives) operation.attach(p);
		return operation;
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
