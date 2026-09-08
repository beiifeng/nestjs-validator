import { getAdapter, getType, parse, registerSchema } from "../helpers.js";
import { hooks } from "../hooks/index.js";
import type { IModelSchema, IModelZ } from "../interface.js";

export function ModelZ<M extends IModelSchema>(schema: M): IModelZ<unknown> {
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
  const adapter = getAdapter(schema);
  const TModel = (hooks.call(
    "onModelZ",
    { adapter, schema, getType },
    { target: InnerModel, targetName: InnerModel.name, name: InnerModel.name },
  )?.target || InnerModel) as IModelZ<unknown>;

  registerSchema(TModel, schema);
  return TModel;
}
