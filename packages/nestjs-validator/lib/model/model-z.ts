import type { IModelSchema, IModelZ } from "../interface";
import { parseToPlain } from "../validator/helpers";

export function ModelZ<M extends IModelSchema>(schema: M): IModelZ<unknown> {
  class InnerModel {
    constructor(plain?: Record<string, unknown>) {
      if (plain) {
        const parsed = parseToPlain(schema, plain);
        this.initialize(parsed as Record<string, unknown>);
      }
    }
    initialize(plain: Record<string, unknown>) {
      Object.assign(this, plain);
    }
  }
  return InnerModel as IModelZ<unknown>;
}
