import { FilterOperation, Operation } from "./Operation";
import { PLABase, toType } from "./PLA";
import * as Truth from "truth-compiler";

export class IsOperation extends FilterOperation 
{
	readonly type: Truth.Type;

	constructor(type: Truth.Type | PLABase) 
	{
		super();
		this.type = toType(type);
	}

	include(type: Truth.Type): boolean 
	{
		return type.is(this.type);
	}
}

export class NotOperation extends Operation 
{
	constructor(readonly operations: Operation[]) 
	{
		super();
	}

	transform(types: Truth.Type[]) 
	{
		let collected: Truth.Type[] = types;

		for (const operation of this.operations) 
		{
			if (operation instanceof FilterOperation) 
			{
				collected = collected.filter(type => !operation.include(type));
			}
			else 
			{
				const result = operation.transform(collected);
				collected = collected.filter(type => result.indexOf(type) < 0);
			}
		}

		return collected;
	}
}
