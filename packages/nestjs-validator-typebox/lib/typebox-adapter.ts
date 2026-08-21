import { validator, type IAdapter, type IModelZ, type IProperty, type ModelOptions } from "@beiifeng/nestjs-validator";
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
  type TSchemaOptions,
  type Static,
  type TFormat,
  type TObject,
  type TProperties,
  type TSchema,
} from "typebox";
import { TypeBoxSchemaPlugin } from "./plugin";
import { validators } from "./store";

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

  getEnumValues(schema: TSchema): unknown[] | null {
    if (!IsEnum(schema)) {
      return null;
    }
    return schema.enum;
  }

  getJSONSchema(schema: TSchema): unknown {
    return schema;
  }

  parse(schema: TSchema, plain: unknown): unknown {
    return validators.getOrInsert(schema).Parse(plain);
  }

  check(schema: TSchema, value: unknown): boolean {
    return validators.getOrInsert(schema).Check(value);
  }
}
