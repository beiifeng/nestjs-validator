import type { IAdapter, IModelZ, IProperty, ModelOptions } from "@beiifeng/nestjs-validator";
import {
  toJSONSchema,
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
  ZodUnion,
  type output as ZodOutput,
} from "zod";

declare module "@beiifeng/nestjs-validator" {
  export function ModelZ<T extends Record<string, ZodType>>(schema: ZodObject<T>): IModelZ<ZodOutput<typeof schema>>;
  export function Model<T extends Record<string, ZodType>>(schema: ZodObject<T>): ClassDecorator;
  export function Model<T extends Record<string, ZodType>>(
    schema: ZodObject<T>,
    options: ModelOptions<ZodType>,
  ): ClassDecorator;
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

export class ZodAdapter implements IAdapter<ZodType> {
  readonly name = "Zod";
  #keyOfIdentifier: string;
  constructor({ keyOfIdentifier }: { keyOfIdentifier: string }) {
    this.#keyOfIdentifier = keyOfIdentifier || "$id";
  }

  isSchema(schema: ZodType): boolean {
    return schema instanceof ZodType;
  }

  isNull(schema: ZodType): boolean {
    return unwrapZod(schema) instanceof ZodNull;
  }

  isUndefined(schema: ZodType): boolean {
    return unwrapZod(schema) instanceof ZodUndefined;
  }

  unwrap(schema: ZodType): ZodType {
    const unwrapped = unwrapZod(schema);
    if (unwrapped instanceof ZodArray) {
      return unwrapped.unwrap() as ZodType;
    }
    // Special handling for union types to unwrap optional and nullable schemas
    // For example, use `z.union([z.string(), z.null()])` to represent a nullable string, and `z.union([z.string(), z.undefined()])` to represent an optional string.
    // But this is unusual, because Zod has a special method `z.string().optional()` and `z.string().nullable()` to represent optional and nullable types.
    if (unwrapped instanceof ZodUnion) {
      const notNullUndefined = unwrapped.options.filter((s) => !(s instanceof ZodNull) && !(s instanceof ZodUndefined));
      if (notNullUndefined.length === 1) {
        return notNullUndefined[0] as ZodType;
      }
    }
    return unwrapped;
  }

  native(schema: ZodType): ReturnType<IAdapter<ZodType>["native"]> {
    const unwrapped = unwrapZod(schema);
    switch (unwrapped.def.type) {
      case "string":
        return String;
      case "bigint":
        return BigInt;
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
    return schema.meta()[this.#keyOfIdentifier] ?? schema;
  }

  getProperties(schema: ZodType): ReturnType<IAdapter<ZodType>["getProperties"]> {
    const unwrapped = unwrapZod(schema);
    if (!(unwrapped instanceof ZodObject)) {
      return null;
    }

    const properties: Record<string, IProperty<ZodType>> = {};
    for (const name in unwrapped.shape) {
      if (!Object.hasOwn(unwrapped.shape, name)) {
        continue;
      }
      const _schema = unwrapped.shape[name] as ZodType;
      properties[name] = { name, schema: _schema, required: !_schema.safeParse(undefined).success };
    }

    return properties;
  }

  getJSONSchema(schema: ZodType): unknown {
    return toJSONSchema(schema, {
      target: "draft-2020-12",
      io: "input",
      unrepresentable: "any",
      override: (ctx) => {
        const def = ctx.zodSchema._zod.def;
        if (def.type === "date") {
          ctx.jsonSchema.type = "string";
          ctx.jsonSchema.format = "date-time";
        }
      },
    });
  }

  parse(schema: ZodType, plain: unknown): unknown {
    return schema.parse(plain);
  }

  check(schema: ZodType, value: unknown): boolean {
    return schema.safeParse(value).success;
  }
}
