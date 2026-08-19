import type { Type } from "@nestjs/common";
import { getAdapter, getType, registerModelSchema } from "../helpers";
import { hooks } from "../hooks";
import type { IModelSchema, ModelOptions } from "../interface";

export function Model(schema: IModelSchema, options?: ModelOptions): ClassDecorator {
  const adapter = getAdapter(schema);
  hooks.call("onModel", { adapter, schema, getType });
  return (target) => {
    registerModelSchema(target as unknown as Type, schema);

    hooks.call(
      "doModel",
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
