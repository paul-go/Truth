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
		 * Collected data.
		 */
		private result?: Truth.Type[];

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

		/**
		 * When a type primitive is attached to the Query, we wrap it inside an `Is`
		 * operation.
		 *
		 * This Weak Map keeps track of all the `Is` operations we have created for
		 * this purpose.
		 */
		private static contentMap = new WeakMap<Truth.Type, Operations.Is>();

		/**
		 * Wrap a type primitive in an `Is` operation.
		 */
		private static prepareContent(type: TypePrimitive) 
		{
			const truthType = toType(type);

			if (Query.contentMap.has(truthType))
				return Query.contentMap.get(truthType)!;

			const operation = new Operations.Is();
			operation.attach(truthType, "append");
			Query.contentMap.set(truthType, operation);
			return operation;
		}

		/**
		 * Add the given operation to this query.
		 * TODO(qti3e) Ref.
		 */
		attach(op: Operation | TypePrimitive): void 
		{
			this.throwAfterStart();
			if (op instanceof Operation) return void this.operations.push(op);

			this.operations.push(Query.prepareContent(op));
		}

		/**
		 * Removes the first occurrence of the given operation from the operations
		 * list.
		 */
		detach(op: Operation | TypePrimitive): boolean 
		{
			this.throwAfterStart();
			if (!(op instanceof Operation))
				return this.detach(Query.prepareContent(op));
			const index = this.operations.indexOf(op);
			if (index < 0) return false;
			this.operations.splice(index, 1);
			return true;
		}

		/**
		 * Returns the list of all the operations attached to this query.
		 */
		getChildren(): Operation[] 
		{
			return this.operations.slice();
		}

		/**
		 * Executes the query synchronously.
		 */
		run() 
		{
			if (this.result) return this.result;
			this.throwAfterStart();
			this.started = true;

			const operations = this.operations.slice();
			let collected: Truth.Type[] = this.data.slice();

			for (const operation of operations) 
			{
				collected = operation.transform(collected);
			}

			return this.result = collected;
		}
	}
}
