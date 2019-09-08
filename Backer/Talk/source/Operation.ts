import * as Truth from "truth-compiler";

/**
 * A operation that transforms collected data in a query.
 */
export type Operation = TransformManyOperation | FilterOperation;

export abstract class TransformManyOperation
{
  /**
   * Returns a new array including a subset of the input data.
   */
  abstract transform(types: Truth.Type[]): Truth.Type[];
}

export abstract class FilterOperation
{
  /**
   * Returns a boolean indicating if this Truth object must stay in the 
   * collected data.
   */
  abstract include(type: Truth.Type): boolean;
}
