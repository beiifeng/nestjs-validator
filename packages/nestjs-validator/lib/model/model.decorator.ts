import { applyDecorators, type Type } from "@nestjs/common";
import type { TObject, TProperties, TSchema } from "typebox";
import type { ZodObject, ZodType } from "zod";
import { getSchemaProperties } from "../validator";
import { MODEL_SCHEMA } from "./store";

const definedModels = new Set<string>();

export interface ModelOptions {
  name?: string;
  decorators?: Array<({ givenName, uniqueName }: { givenName: string; uniqueName: string }) => ClassDecorator | null>;
  propertyProcessor?: (target: object, propertyName: string, propertySchema: ZodType | TSchema) => void;
}

export function Model<T extends Record<string, ZodType>>(schema: ZodObject<T>): ClassDecorator;
export function Model<T extends Record<string, ZodType>>(schema: ZodObject<T>, options: ModelOptions): ClassDecorator;
export function Model<T extends TProperties>(schema: TObject<T>): ClassDecorator;
export function Model<T extends TProperties>(schema: TObject<T>, options: ModelOptions): ClassDecorator;

export function Model(schema: ZodObject | TObject, options?: ModelOptions): ClassDecorator {
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
