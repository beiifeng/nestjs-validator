import {
  validator,
  type IAdapter,
  type IModelZ,
  type IPlugin,
  type IProperty,
  type ModelOptions,
} from "@beiifeng/nestjs-validator";
import {
  IsArray,
  IsBoolean,
  IsInteger,
  IsNull,
  IsNumber,
  IsObject,
  IsSchema,
  IsString,
  IsUndefined,
  type Static,
  type TFormat,
  type TObject,
  type TProperties,
  type TSchema,
} from "typebox";
import Schema from "typebox/schema";

declare module "@beiifeng/nestjs-validator" {
  export function ModelZ<T extends TProperties>(schema: TObject<T>): IModelZ<Static<typeof schema>>;
  export function Model<T extends TProperties>(schema: TObject<T>): ClassDecorator;
  export function Model<T extends TProperties>(schema: TObject<T>, options: ModelOptions<TSchema>): ClassDecorator;
}

declare module "typebox" {
  export interface TSchema {
    $id?: string;
  }

  export interface TString {
    format?: TFormat;
  }
}

const schemaValidator: Map<TSchema, Schema.Validator> = new Map();

class TypeBoxSchemaCheckerPlugin implements IPlugin {
  readonly type = "onModel";
  readonly name = "TypeBoxSchemaCheckerPlugin";
  apply(_adapter: IAdapter<TSchema>, schema: TSchema): void {
    if (!IsSchema(schema)) {
      return;
    }
    if (!schemaValidator.has(schema)) {
      schemaValidator.set(schema, Schema.Compile(schema));
    }
  }
}

export class TypeBoxAdapter implements IAdapter<TSchema> {
  name = "TypeBox";

  constructor() {
    validator.addPlugin(new TypeBoxSchemaCheckerPlugin());
  }

  isSchema(schema: TSchema): boolean {
    return IsSchema(schema);
  }

  isNull(schema: TSchema): boolean {
    return IsNull(schema);
  }

  isUndefined(schema: TSchema): boolean {
    return IsUndefined(schema);
  }

  unwrap(schema: TSchema): TSchema {
    if (IsArray(schema)) {
      return schema.items;
    }
    return schema;
  }

  native(schema: TSchema): ReturnType<IAdapter<TSchema>["native"]> {
    if (IsNumber(schema) || IsInteger(schema)) {
      return Number;
    }
    if (IsBoolean(schema)) {
      return Boolean;
    }
    if (IsString(schema)) {
      if (schema.format === "date-time" || schema.format === "date") {
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
    return null;
  }

  getIdentifier(schema: TSchema): unknown | null {
    return schema.$id ?? schema;
  }

  getProperties(schema: TSchema): ReturnType<IAdapter<TSchema>["getProperties"]> {
    if (!IsObject(schema)) {
      return null;
    }

    const properties: Record<string, IProperty<TSchema>> = {};
    Object.entries(schema.properties).forEach(([key, value]) => {
      properties[key] = {
        name: key,
        schema: value,
        required: schema.required?.includes(key) ?? false,
      };
    });

    return properties;
  }

  parse(schema: TSchema, plain: unknown): unknown {
    if (schemaValidator.has(schema)) {
      return schemaValidator.get(schema).Parse(plain);
    }
    return Schema.Compile(schema).Parse(plain);
  }

  check(schema: TSchema, value: unknown): boolean {
    if (schemaValidator.has(schema)) {
      return schemaValidator.get(schema).Check(value);
    }
    return Schema.Compile(schema).Check(value);
  }
}
