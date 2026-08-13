import type { IProperty, ValidatorAdapter } from "@beiifeng/nestjs-validator";
import {
  ZodArray,
  ZodBoolean,
  ZodCatch,
  ZodDate,
  ZodDefault,
  ZodExactOptional,
  ZodLazy,
  ZodNonOptional,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodPrefault,
  ZodPromise,
  ZodReadonly,
  ZodString,
  ZodSuccess,
  ZodType,
  ZodUndefined,
} from "zod";

function unwrapSchema(schema: ZodType): ZodType {
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

export class ZodAdapter implements ValidatorAdapter {
  name = "Zod";

  isSchema(schema: ZodType): boolean {
    return schema instanceof ZodType;
  }

  isNull(schema: unknown): boolean {
    return unwrapSchema(schema as ZodType) instanceof ZodNull;
  }

  isUndefined(schema: unknown): boolean {
    return unwrapSchema(schema as ZodType) instanceof ZodUndefined;
  }

  isArray(schema: unknown): boolean {
    return unwrapSchema(schema as ZodType) instanceof ZodArray;
  }

  nativeType(
    schema: unknown,
  ):
    | StringConstructor
    | NumberConstructor
    | BooleanConstructor
    | DateConstructor
    | ArrayConstructor
    | ObjectConstructor
    | null {
    const unwrapped = unwrapSchema(schema as ZodType);
    if (unwrapped instanceof ZodNumber) {
      return Number;
    }
    if (unwrapped instanceof ZodBoolean) {
      return Boolean;
    }
    if (unwrapped instanceof ZodDate) {
      return Date;
    }
    if (unwrapped instanceof ZodString) {
      return String;
    }
    if (unwrapped instanceof ZodArray) {
      return Array;
    }
    if (unwrapped instanceof ZodObject) {
      return Object;
    }
    return null;
  }

  unwrap(schema: unknown): ZodType {
    const unwrapped = unwrapSchema(schema as ZodType);
    if (unwrapped instanceof ZodArray) {
      return unwrapped.unwrap() as ZodType;
    }
    return unwrapped;
  }

  getIdentifier(schema: ZodType): unknown | null {
    return schema.meta().$id ?? schema;
  }

  getProperties(schema: unknown): Record<string, IProperty> | null {
    const unwrapped = unwrapSchema(schema as ZodType);
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

  parse(schema: unknown, plain: unknown): unknown {
    return (schema as ZodType).parse(plain);
  }

  check(schema: unknown, value: unknown): boolean {
    return (schema as ZodType).safeParse(value).success;
  }
}
