import { FilterOperation } from "./Operation";
import * as Truth from "truth-compiler";

export class IsOperation extends FilterOperation
{
  constructor(readonly type: Truth.Type)
  {
    super();
  }

  include(type: Truth.Type): boolean
  {
    return type.is(this.type);
  }
}
