import { applyDecorators, type Type } from "@nestjs/common";
import type { IModelSchema, ISchema, ModelOption } from "../interface";
import { getSchemaProperties } from "../validator/helpers";
import { MODEL_SCHEMA } from "./store";

const definedModels = new Set<string>();

export function Model(schema: IModelSchema, options?: ModelOption<ISchema>): ClassDecorator {
  return (target) => {
    const name = options?.name || target.name;
    const decorators = options?.decorators || [];

    MODEL_SCHEMA.set(target as unknown as Type, schema);
    if (options?.propertyProcessor) {
      const properties = getSchemaProperties(schema);
      if (properties) {
        for (const propertyName in properties) {
          const property = properties[propertyName];
          options.propertyProcessor(target.prototype, propertyName, property.schema);
        }
      }
    }

    let uniqueName = name;
    let count = 1;
    if (definedModels.has(uniqueName)) {
      while (definedModels.has(`${uniqueName}_${count}`)) {
        count++;
      }
      uniqueName = `${uniqueName}_${count}`;
    }
    definedModels.add(uniqueName);

    const effectDecorators = decorators
      .map((decoratorFn) => decoratorFn({ givenName: name, uniqueName }))
      .filter((decorator) => decorator !== null);

    if (effectDecorators.length > 0) {
      return applyDecorators(...effectDecorators)(target);
    }
    return target;
  };
}
