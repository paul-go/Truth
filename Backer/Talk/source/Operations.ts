namespace Reflex.Talk {
	export class IsOperation extends FilterOperation
		implements Branch<TypePrimitive> 
	{
		type: Truth.Type | undefined;

		attach(type: TypePrimitive) 
		{
			this.type = toType(type);
		}

		detach(type: TypePrimitive) 
		{
			if (this.type === type) 
			{
				this.type = undefined;
				return true;
			}
			return false;
		}

		include(type: Truth.Type) 
		{
			return type.is(this.type!);
		}
	}

	export class NotOperation extends Operation implements Branch<Operation> 
	{
		readonly operations: Operation[] = [];

		attach(operation: Operation) 
		{
			this.operations.push(operation);
		}

		detach(operation: Operation) 
		{
			const index = this.operations.indexOf(operation);
			if (index < 0) return false;
			this.operations.splice(index, 1);
			return true;
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

	export class OrOperation extends FilterOperation
		implements Branch<Operation> 
	{
		readonly operations: Operation[] = [];
		private numNonFilterOperations = 0;

		attach(operation: Operation) 
		{
			this.operations.push(operation);
		}

		detach(operation: Operation) 
		{
			const index = this.operations.indexOf(operation);
			if (index < 0) return false;
			this.operations.splice(index, 1);
			return true;
		}

		include(type: Truth.Type) 
		{
			for (const operation of this.operations) 
			{
				if (operation instanceof FilterOperation) 
				{
					if (operation.include(type)) return true;
				}
				else if (operation.transform([type]).length) return true;
			}
			return false;
		}
	}

	export class HasOperation extends FilterOperation
		implements Branch<TypePrimitive | FilterOperation> 
	{
		readonly types: Truth.Type[] = [];
		readonly operations: FilterOperation[] = [];

		attach(node: TypePrimitive | FilterOperation) 
		{
			if (node instanceof FilterOperation) this.operations.push(node);
			else this.types.push(toType(node));
		}

		detach(node: TypePrimitive | FilterOperation) 
		{
			const array =
				node instanceof FilterOperation ? this.operations : this.types;
			const index = array.indexOf(node as any);
			if (index < 0) return false;
			array.splice(index, 1);
			return true;
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

	export class GreaterThanOperation extends FilterOperation
		implements Branch<number | string> 
	{
		constructor(private value?: number | string) 
		{
			super();
		}

		attach(value: number | string) 
		{
			this.value = value;
		}

		detach(value: number | string) 
		{
			if (value === this.value) 
			{
				this.value = undefined;
				return true;
			}
			return false;
		}

		include(type: Truth.Type): boolean 
		{
			const value = type.value;
			if (value === null) return false;
			// TODO(qti3e) This check can be optimized in the attach function.
			// this.include = ....
			if (typeof this.value === "number") return Number(value) > this.value;
			return value > this.value!;
		}
	}

	export class LessThanOperation extends FilterOperation
		implements Branch<number | string> 
	{
		constructor(private value?: number | string) 
		{
			super();
		}

		attach(value: number | string) 
		{
			this.value = value;
		}

		detach(value: number | string) 
		{
			if (value === this.value) 
			{
				this.value = undefined;
				return true;
			}
			return false;
		}

		include(type: Truth.Type): boolean 
		{
			const value = type.value;
			if (value === null) return false;
			// TODO(qti3e) This check can be optimized in the attach function.
			// this.include = ....
			if (typeof this.value === "number") return Number(value) < this.value;
			return value < this.value!;
		}
	}
}
