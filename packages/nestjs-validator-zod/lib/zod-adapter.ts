import type { IAdapter, IModelZ, IProperty, ModelOptions } from "@beiifeng/nestjs-validator";
import {
    ZodArray,
    ZodCatch,
    ZodDefault,
    ZodExactOptional,
    ZodLazy,
    ZodNonOptional,
    ZodNull,
    ZodNullable,
    ZodObject,
    ZodOptional,
    ZodPrefault,
    ZodPromise,
    ZodReadonly,
    ZodSuccess,
    ZodType,
    ZodUndefined,
    type output as ZodOutput,
} from "zod";

declare module "@beiifeng/nestjs-validator" {
  namespace Validator {
    interface Adapters {
      Zod: Validator.Schemas<ZodType, ZodObject>;
    }
  }

  export function ModelZ<T extends Record<string, ZodType>>(schema: ZodObject<T>): IModelZ<ZodOutput<typeof schema>>;
  export function Model<T extends Record<string, ZodType>>(schema: ZodObject<T>): ClassDecorator;
  export function Model<T extends Record<string, ZodType>>(schema: ZodObject<T>, options: ModelOptions): ClassDecorator;
}

function unwrapZod(schema: ZodType): ZodType {
  let current = schema;
  while (
    current instanceof ZodOptional ||
    current instanceof ZodExactOptional ||
    current instanceof ZodNullable ||
    current instanceof ZodDefault ||
    current instanceof ZodPrefault ||
    current instanceof ZodSuccess ||
    current instanceof ZodNonOptional ||
    current instanceof ZodCatch ||
    current instanceof ZodReadonly ||
    current instanceof ZodLazy ||
    current instanceof ZodPromise
  ) {
    current = current.unwrap() as ZodType;
  }
  return current;
}

export class ZodAdapter implements IAdapter {
  name = "Zod";

  isSchema(schema: ZodType): boolean {
    return schema instanceof ZodType;
  }

  isNull(schema: ZodType): boolean {
    return unwrapZod(schema as ZodType) instanceof ZodNull;
  }

  isUndefined(schema: ZodType): boolean {
    return unwrapZod(schema as ZodType) instanceof ZodUndefined;
  }

  unwrap(schema: ZodType): ZodType {
    const unwrapped = unwrapZod(schema as ZodType);
    if (unwrapped instanceof ZodArray) {
      return unwrapped.unwrap() as ZodType;
    }
    return unwrapped;
  }

  native(schema: ZodType): ReturnType<IAdapter["native"]> {
    const unwrapped = unwrapZod(schema as ZodType);
    switch (unwrapped.def.type) {
      case "string":
        return String;
      case "number":
      case "int":
        return Number;
      case "boolean":
        return Boolean;
      case "date":
        return Date;
      case "array":
        return Array;
      case "object":
      case "record":
        return Object;
      default:
        return null;
    }
  }

  getIdentifier(schema: ZodType): unknown | null {
    return schema.meta().$id ?? schema;
  }

  getProperties(schema: ZodType): Record<string, IProperty> | null {
    const unwrapped = unwrapZod(schema);
    if (!(unwrapped instanceof ZodObject)) {
      return null;
    }

    const properties: Record<string, IProperty> = {};
    for (const name in unwrapped.shape) {
      if (!Object.hasOwn(unwrapped.shape, name)) {
        continue;
      }
      const _schema = unwrapped.shape[name] as ZodType;
      properties[name] = { name, schema: _schema, required: !_schema.safeParse(undefined).success };
    }

    return properties;
  }

  parse(schema: ZodType, plain: unknown): unknown {
    return schema.parse(plain);
  }

  check(schema: ZodType, value: unknown): boolean {
    return schema.safeParse(value).success;
  }
}
