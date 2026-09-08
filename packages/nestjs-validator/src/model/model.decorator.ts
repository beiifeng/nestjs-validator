import type { Type } from "@nestjs/common";
import { getAdapter, getType, registerModel } from "../helpers.js";
import { hooks } from "../hooks/index.js";
import type { IModelSchema, ModelOptions } from "../interface.js";

export function Model(schema: IModelSchema, options?: ModelOptions): ClassDecorator {
  const adapter = getAdapter(schema);
  hooks.call("onModelInit", { adapter, schema, getType });
  return (target) => {
    registerModel(schema, target as unknown as Type);

    hooks.call(
      "onModelApply",
      { adapter, schema, getType },
      {
        target: target as unknown as Type,
        targetName: target.name,
        name: options?.name || target.name,
        description: options?.description,
      },
    );

    return target;
  };
}
