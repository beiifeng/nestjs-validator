import type { IModelSchema } from "../interface";
import { parseToPlain } from "../validator/helpers";

export interface IModelZ<T> {
  new (): T;
  new (plain: Partial<T>): T;
}

export function ModelZ(schema: IModelSchema): IModelZ<unknown> {
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
