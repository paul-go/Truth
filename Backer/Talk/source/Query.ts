import { Operation, TransformManyOperation, FilterOperation } from "./Operation";
import * as Truth from "truth-compiler";

/**
 * A Truth Query.
 */
export class Query
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

  /**
   * Add the given operation to this query.
   */
  addOperation(op: Operation): void
  {
    this.throwAfterStart();
    this.operations.push(op);
  }

  /**
   * Removes the first occurrence of the given operation from the operations
   * list.
   */
  removeOperation(op: Operation): boolean
  {
    this.throwAfterStart();
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

    for (const operation of operations) {
      collected = operation.transform(collected);
    }

    return collected;
  }
}
