import {
  NotMatchError,
  type IAdapter,
  type IModelZ,
  type IProperty,
  type ModelOptions,
} from "@beiifeng/nestjs-validator";
import { Logger } from "@nestjs/common";
import {
  toJSONSchema,
  ZodArray,
  ZodCatch,
  ZodDefault,
  ZodEnum,
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

export type ZodAdapterOptions = {
  keyOfIdentifier?: string;
};

export class ZodAdapter implements IAdapter<ZodType> {
  readonly name = "Zod";
  #logger = new Logger(ZodAdapter.name);
  #keyOfIdentifier: string;
  constructor(options?: ZodAdapterOptions) {
    this.#keyOfIdentifier = options?.keyOfIdentifier || "$id";
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

  isArray(schema: ZodType): boolean {
    return unwrapZod(schema) instanceof ZodArray;
  }

  isEnum(schema: ZodType): boolean {
    return unwrapZod(schema) instanceof ZodEnum;
  }

  unwrap(schema: ZodType): ZodType {
    const unwrapped = unwrapZod(schema);
    if (unwrapped instanceof ZodArray) {
      return unwrapped.unwrap() as ZodType;
    }
    // Special handling for union types to unwrap optional and nullable schemas
    // For example, use `z.union([z.string(), z.null()])` to represent a nullable string, and `z.union([z.string(), z.undefined()])` to represent an optional string.
    // But this is unusual, because Zod has a special method `z.string().nullable()` and `z.string().optional()` to represent nullable and optional types.
    if (unwrapped instanceof ZodUnion) {
      const notNil = unwrapped.options.filter((s) => !(s instanceof ZodNull) && !(s instanceof ZodUndefined));
      if (notNil.length === 1) {
        return notNil[0] as ZodType;
      }
    }
    return unwrapped;
  }

  native(schema: ZodType): ReturnType<IAdapter<ZodType>["native"]> {
    const unwrapped = unwrapZod(schema);
    switch (unwrapped.def.type) {
      case "bigint":
        return BigInt;
      case "number":
      case "int":
        return Number;
      case "boolean":
        return Boolean;
      case "string":
        return String;
      case "date":
        return Date;
      case "array":
        return Array;
      case "object":
      case "record":
        return Object;
      case "enum":
        return typeof (unwrapped as ZodEnum).options[0] === "number" ? Number : String;
      default:
        this.#logger.debug(`Unsupported Zod type '${unwrapped.def.type}' for native type mapping.`);
        return null;
    }
  }

  getIdentifier(schema: ZodType): unknown | null {
    return schema.meta()?.[this.#keyOfIdentifier] ?? schema;
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
      properties[name] = {
        name,
        schema: _schema,
        required: !_schema.safeParse(undefined).success,
        description: _schema.meta()?.description || _schema.description,
        example: _schema.meta()?.example,
        examples: _schema.meta()?.examples as unknown[] | undefined,
      };
    }

    return properties;
  }

  getDefaultValue(schema: ZodType): unknown | undefined {
    return schema.safeParse(undefined).data;
  }

  getEnumValues(schema: ZodType): unknown[] | null {
    const unwrapped = unwrapZod(schema);
    if (!(unwrapped instanceof ZodEnum)) {
      return null;
    }
    return unwrapped.options;
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

  parse<T = unknown>(schema: ZodType, plain: unknown): [NotMatchError, null] | [null, T] {
    const result = schema.safeParse(plain);
    if (result.success) {
      return [null, result.data as T];
    }
    const firstError = result.error.issues[0];
    const error = new NotMatchError(
      firstError.message,
      firstError.path.map((p) => (typeof p === "string" ? p : String(p))),
    );
    return [error, null];
  }

  check(schema: ZodType, value: unknown): NotMatchError | null {
    const result = schema.safeParse(value);
    if (result.success) {
      return null;
    }
    const firstError = result.error.issues[0];
    return new NotMatchError(
      firstError.message,
      firstError.path.map((p) => (typeof p === "string" ? p : String(p))),
    );
  }
}
