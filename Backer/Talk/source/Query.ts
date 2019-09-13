namespace Reflex.Talk {
	/**
	 * A Truth Query.
	 */
	export class Query implements Branch<Operation> 
	{
		/**
		 * List of operations that must be executed on the data.
		 */
		private readonly operations: Operation[] = [];

		/**
		 * Indicates whatever `run` method is called or not.
		 */
		private started = false;

		/**
		 * Constructs a new Truth query.
		 *
		 * @param {Truth.Type[]} data Original dataset which you want to run the
		 * operations on.
		 */
		constructor(private data: Truth.Type[]) {}

		/**
		 * Throws an error if this query is started.
		 */
		private throwAfterStart() 
		{
			if (!this.started) return;
			throw new Error("A TruthQuery is readonly after calling `run`.");
		}

		private contentMap = new WeakMap<Truth.Type, IsOperation>();

		private prepareContent(type: TypePrimitive) 
		{
			const truthType = toType(type);

			if (this.contentMap.has(truthType))
				return this.contentMap.get(truthType)!;

			const operation = new IsOperation();
			operation.attach(truthType);
			this.contentMap.set(truthType, operation);
			return operation;
		}

		/**
		 * Add the given operation to this query.
		 */
		attach(op: Operation | TypePrimitive): void 
		{
			this.throwAfterStart();
			if (op instanceof Operation) return void this.operations.push(op);

			this.operations.push(this.prepareContent(op));
		}

		/**
		 * Removes the first occurrence of the given operation from the operations
		 * list.
		 */
		detach(op: Operation | TypePrimitive): boolean 
		{
			this.throwAfterStart();
			if (!(op instanceof Operation))
				return this.detach(this.prepareContent(op));
			const index = this.operations.indexOf(op);
			if (index < 0) return false;
			this.operations.splice(index, 1);
			return true;
		}

		/**
		 * Executes the query synchronously.
		 */
		run() 
		{
			this.throwAfterStart();
			this.started = true;

			const operations = this.operations.slice();
			let collected: Truth.Type[] = this.data.slice();

			for (const operation of operations) 
			{
				collected = operation.transform(collected);
			}

			return collected;
		}
	}
}
