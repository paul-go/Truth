namespace Reflex.Talk.Operations {
	function attach<T extends {}>(array: T[], value: T, ref?: AttachRef<T>) 
	{
		if (!ref || ref === "append") return void array.push(value);
		if (ref === "prepend") return void array.unshift(value);
		const index = array.indexOf(ref);
		if (index < 0) return void array.push(value);
		array.splice(index + 1, 0, value);
	}

	abstract class FilterOperationTalkBranch<T> extends FilterOperation
		implements TalkBranch<T> 
	{
		protected values: T[] = [];

		get value(): T | undefined 
		{
			return this.values[0];
		}

		attach(value: T, ref: AttachRef<T>) 
		{
			attach(this.values, value, ref);
		}

		detach(value: T) 
		{
			const index = this.values.indexOf(value);
			if (index < 0) return false;
			this.values.splice(index, 1);
			return true;
		}

		getChildren() 
		{
			return this.values.slice();
		}
	}

	export class Is extends FilterOperationTalkBranch<TypePrimitive> 
	{
		include(type: Truth.Type) 
		{
			return type.is(toType(this.value!));
		}
	}

	export class Not extends FilterOperationTalkBranch<Operation> 
	{
		transform(types: Truth.Type[]) 
		{
			let collected: Truth.Type[] = types;

			for (const operation of this.values) 
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

		include(type: Truth.Type) 
		{
			if (this.values.length === 0) return false;
			if (this.values.length === 1) 
			{
				const [first] = this.values;
				if (first instanceof FilterOperation) return !first.include(type);
			}
			return this.transform([type]).length === 1;
		}
	}

	export class Or extends FilterOperationTalkBranch<Operation> 
	{
		include(type: Truth.Type) 
		{
			for (const operation of this.values) 
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

	export class Has extends FilterOperationTalkBranch<
		TypePrimitive | FilterOperation
	> 
	{
		private is(contentType: Truth.Type, type: Truth.Type) 
		{
			if (contentType.is(type)) return true;

			for (const parallel of contentType.iterate(t => t.parallels)) 
			{
				if (parallel.type === type) return true;
			}

			return false;
		}

		private splitValues(): [Truth.Type[], FilterOperation[]] 
		{
			const types: Truth.Type[] = [];
			const operations: FilterOperation[] = [];

			for (const value of this.values) 
			{
				if (value instanceof FilterOperation) 
				{
					operations.push(value);
				}
				else 
				{
					types.push(toType(value));
				}
			}

			return [types, operations];
		}

		include(type: Truth.Type): boolean 
		{
			const [types, operations] = this.splitValues();

			let contentTypes = type.contents;

			for (const type of types) 
			{
				contentTypes = contentTypes.filter(contentType =>
					this.is(contentType, type)
				);
				if (contentTypes.length === 0) return false;
			}

			for (const operation of operations) 
			{
				for (const contentType of contentTypes) 
				{
					if (!operation.include(contentType)) return false;
				}
			}

			return true;
		}
	}

	export class GreaterThan extends FilterOperationTalkBranch<string | number> 
	{
		constructor(value?: number | string) 
		{
			super();
			if (value !== undefined) this.values.push(value);
		}

		include(type: Truth.Type): boolean 
		{
			const value = type.value;
			if (value === null) return false;
			if (typeof this.value === "number") return Number(value) > this.value;
			return value > this.value!;
		}
	}

	export class LessThan extends FilterOperationTalkBranch<string | number> 
	{
		constructor(value?: number | string) 
		{
			super();
			if (value !== undefined) this.values.push(value);
		}

		include(type: Truth.Type): boolean 
		{
			const value = type.value;
			if (value === null) return false;
			if (typeof this.value === "number") return Number(value) < this.value;
			return value < this.value!;
		}
	}

	export class Equals extends FilterOperationTalkBranch<string | number> 
	{
		include(type: Truth.Type): boolean 
		{
			const value = type.value;
			if (value === null) return false;
			if (typeof this.value === "number") return Number(value) === this.value;
			return JSON.parse(value) === this.value;
		}
	}
}
