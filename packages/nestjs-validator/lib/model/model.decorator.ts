import type { Type } from "@nestjs/common";
import type { IModelSchema, ISchema, ModelOptions } from "../interface";
import { getAdapter } from "../validator/helpers";
import { hooks } from "../validator/store";
import { MODEL_SCHEMA } from "./store";

export function Model(schema: IModelSchema, options?: ModelOptions<ISchema>): ClassDecorator {
  const adapter = getAdapter(schema);
  hooks.call("onModel", adapter, schema);
  return (target) => {
    MODEL_SCHEMA.set(target as unknown as Type, schema);

    hooks.call("doModel", adapter, schema, {
      target: target as unknown as Type,
      targetName: target.name,
      name: options?.name || target.name,
    });

    return target;
  };
}
