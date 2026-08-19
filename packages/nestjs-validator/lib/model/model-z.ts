import { getAdapter, getType, parse } from "../helpers";
import { hooks } from "../hooks";
import type { IModelSchema, IModelZ } from "../interface";

export function ModelZ<M extends IModelSchema>(schema: M): IModelZ<unknown> {
  const adapter = getAdapter(schema);
  hooks.call("onModelZ", { adapter, schema, getType });
  class InnerModel {
    constructor(plain?: Record<string, unknown>) {
      if (plain) {
        const parsed = parse(schema, plain);
        this.initialize(parsed as Record<string, unknown>);
      }
    }
    initialize(plain: Record<string, unknown>) {
      Object.assign(this, plain);
    }
  }
  return InnerModel as IModelZ<unknown>;
}
