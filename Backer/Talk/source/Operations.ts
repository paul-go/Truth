import { FilterOperation, Operation } from "./Operation";
import { PLABase, toType, TypePrimitive } from "./PLA";
import * as Truth from "truth-compiler";

export class IsOperation extends FilterOperation 
{
	readonly type: Truth.Type;

	constructor(type: TypePrimitive) 
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

export class HasOperation extends FilterOperation 
{
	readonly types: Truth.Type[] = [];

	constructor(types: TypePrimitive[], readonly operations: FilterOperation[]) 
	{
		super();
		this.types = types.map(t => toType(t));
	}

	private is(contentType: Truth.Type, type: Truth.Type) 
	{
		if (contentType.is(type)) return true;

		for (const parallel of contentType.iterate(t => t.parallels)) 
		{
			if (parallel.type === type) return true;
		}

		return false;
	}

	include(type: Truth.Type): boolean 
	{
		let contentTypes = type.contents;

		for (const type of this.types) 
		{
			contentTypes = contentTypes.filter(contentType =>
				this.is(contentType, type)
			);
			if (contentTypes.length === 0) return false;
		}

		for (const operation of this.operations) 
		{
			for (const contentType of contentTypes) 
			{
				if (!operation.include(contentType)) return false;
			}
		}

		return true;
	}
}
