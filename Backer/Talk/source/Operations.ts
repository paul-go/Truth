import * as X from "./X";
import * as Truth from "truth-compiler";

export class IsOperation extends X.FilterOperation 
{
	readonly type: Truth.Type;

	constructor(type: X.TypePrimitive) 
	{
		super();
		this.type = X.toType(type);
	}

	include(type: Truth.Type): boolean 
	{
		return type.is(this.type);
	}
}

export class NotOperation extends X.Operation 
{
	constructor(readonly operations: X.Operation[]) 
	{
		super();
	}

	transform(types: Truth.Type[]) 
	{
		let collected: Truth.Type[] = types;

		for (const operation of this.operations) 
		{
			if (operation instanceof X.FilterOperation) 
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

export class HasOperation extends X.FilterOperation 
{
	readonly types: Truth.Type[] = [];

	constructor(
		types: X.TypePrimitive[],
		readonly operations: X.FilterOperation[]
	) 
	{
		super();
		this.types = types.map(t => X.toType(t));
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

export class GreaterThanOperation extends X.FilterOperation 
{
	constructor(readonly value: number | string) 
	{
		super();
	}

	include(type: Truth.Type): boolean 
	{
		const value = type.value;
		if (value === null) return false;
		// TODO(qti3e) This check can be optimized in the constructor.
		// this.include = ....
		if (typeof this.value === "number") return Number(value) > this.value;
		return value > this.value;
	}
}

export class LessThanOperation extends X.FilterOperation 
{
	constructor(readonly value: number | string) 
	{
		super();
	}

	include(type: Truth.Type): boolean 
	{
		const value = type.value;
		if (value === null) return false;
		// TODO(qti3e) This check can be optimized in the constructor.
		// this.include = ....
		if (typeof this.value === "number") return Number(value) < this.value;
		return value < this.value;
	}
}
