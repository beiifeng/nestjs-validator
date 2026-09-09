import { getAdapter, getType, registerSchema } from "../helpers.js";
import { hooks } from "../hooks/index.js";
import type { IModelSchema, IModelZ } from "../interface.js";

export function ModelZ<M extends IModelSchema>(schema: M): IModelZ<unknown> {
  class InnerModel {
    static initialize: (plain: Record<string, unknown>) => InnerModel;
    initialize(plain: Record<string, unknown>) {
      Object.assign(this, plain);
      return this;
    }
  }
  InnerModel.initialize = function initialize(plain: Record<string, unknown>) {
    return new this().initialize(plain);
  };
  const adapter = getAdapter(schema);
  const TModel = (hooks.call(
    "onModelZ",
    { adapter, schema, getType },
    { target: InnerModel, targetName: InnerModel.name, name: InnerModel.name },
  )?.target || InnerModel) as IModelZ<unknown>;

  registerSchema(TModel, schema);
  return TModel;
}
