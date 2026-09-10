import {
  NotMatchError,
  validator,
  type IAdapter,
  type IModelZ,
  type IProperty,
  type ModelOptions,
} from "@beiifeng/nestjs-validator";
import { Logger } from "@nestjs/common";
import {
  IsArray,
  IsBigInt,
  IsBoolean,
  IsEnum,
  IsInteger,
  IsNull,
  IsNumber,
  IsObject,
  IsSchema,
  IsString,
  IsUndefined,
  IsUnion,
  NonNullable,
  type Static,
  type TFormat,
  type TObject,
  type TProperties,
  type TSchema,
  type TSchemaOptions,
} from "typebox";
import { ParseError } from "typebox/schema";
import { Settings } from "typebox/system";
import { TypeBoxSchemaPlugin } from "./plugin.js";
import { validators } from "./store.js";

declare module "@beiifeng/nestjs-validator" {
  export function ModelZ<T extends TProperties>(schema: TObject<T>): IModelZ<Static<typeof schema>>;
  export function Model<T extends TProperties>(schema: TObject<T>): ClassDecorator;
  export function Model<T extends TProperties>(schema: TObject<T>, options: ModelOptions): ClassDecorator;
}

declare module "typebox" {
  export interface TSchemaOptions {
    id?: string;
  }

  export interface TString {
    format?: TFormat;
  }
}

export type TypeBoxAdapterOptions = {
  keyOfIdentifier?: string;
};

export class TypeBoxAdapter implements IAdapter<TSchema> {
  readonly name = "TypeBox";
  #keyOfIdentifier: string;
  #logger = new Logger(TypeBoxAdapter.name);
  constructor(options?: TypeBoxAdapterOptions) {
    validator.addPlugin(new TypeBoxSchemaPlugin());
    this.#keyOfIdentifier = options?.keyOfIdentifier || "$id";
  }

  isSchema(schema: TSchema): boolean {
    return IsSchema(schema) && "~kind" in schema;
  }

  isNull(schema: TSchema): boolean {
    return IsNull(schema);
  }

  isUndefined(schema: TSchema): boolean {
    return IsUndefined(schema);
  }

  isArray(schema: TSchema): boolean {
    return IsArray(schema);
  }

  isEnum(schema: TSchema): boolean {
    return IsEnum(schema);
  }

  unwrap(schema: TSchema): TSchema {
    if (IsArray(schema)) {
      return schema.items;
    }
    // Special handling for union types to unwrap optional and nullable schemas
    // For example, use `t.Union([t.String(), t.Null()])` to represent a nullable string, and `t.Union([t.String(), t.Undefined()])` to represent an optional string.
    if (IsUnion(schema)) {
      return NonNullable(schema);
    }
    return schema;
  }

  native(schema: TSchema): ReturnType<IAdapter<TSchema>["native"]> {
    if (IsBigInt(schema)) {
      return BigInt;
    }
    if (IsNumber(schema) || IsInteger(schema)) {
      return Number;
    }
    if (IsBoolean(schema)) {
      return Boolean;
    }
    if (IsString(schema)) {
      if (schema.format === "date-time" || schema.format === "date" || schema.format === "time") {
        return Date;
      }
      return String;
    }
    if (IsArray(schema)) {
      return Array;
    }
    if (IsObject(schema)) {
      return Object;
    }
    if (IsEnum(schema)) {
      return typeof schema.enum[0] === "number" ? Number : String;
    }
    this.#logger.debug(`Unsupported TypeBox type for native type mapping: ${JSON.stringify(schema)}`);
    return null;
  }

  getIdentifier(schema: TSchema): unknown | null {
    return schema[this.#keyOfIdentifier] ?? schema;
  }

  getProperties(schema: TSchema): ReturnType<IAdapter<TSchema>["getProperties"]> {
    if (!IsObject(schema)) {
      return null;
    }

    const properties: Record<string, IProperty<TSchema>> = {};
    Object.entries(schema.properties).forEach(([name, _schema]) => {
      properties[name] = {
        name,
        schema: _schema,
        required: Boolean(schema.required?.includes(name)),
        description: (_schema as TSchemaOptions).description,
        example: (_schema as TSchemaOptions).example,
        examples: (_schema as TSchemaOptions).examples as unknown[] | undefined,
      };
    });

    return properties;
  }

  getDefaultValue(schema: TSchema): unknown | undefined {
    try {
      return validators.getOrInsert(schema).Parse(undefined);
    } catch {
      return undefined;
    }
  }

  getEnumValues(schema: TSchema): unknown[] | null {
    if (!IsEnum(schema)) {
      return null;
    }
    return schema.enum;
  }

  getJSONSchema(schema: TSchema): unknown {
    return schema;
  }

  parse<T = unknown>(schema: TSchema, plain: unknown): [NotMatchError, null] | [null, T] {
    Settings.Set({ maxErrors: 1 });
    try {
      const data = validators.getOrInsert(schema).Parse(plain) as T;
      return [null, data];
    } catch (e) {
      if (e instanceof ParseError) {
        const firstError = e.errors[0];
        const error = new NotMatchError(firstError.message, firstError.instancePath.split("/").filter(Boolean));
        return [error, null];
      }
      throw e;
    }
  }

  check(schema: TSchema, value: unknown): NotMatchError | null {
    Settings.Set({ maxErrors: 1 });
    try {
      validators.getOrInsert(schema).Parse(value);
      return null;
    } catch (e) {
      if (e instanceof ParseError) {
        const firstError = e.errors[0];
        return new NotMatchError(firstError.message, firstError.instancePath.split("/").filter(Boolean));
      }
      throw e;
    }
  }
}
