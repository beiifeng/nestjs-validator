import { Logger, type ArgumentMetadata, type PipeTransform, type Type } from "@nestjs/common";
import { check, getDefaultValue, getProperties, getSchema, getType, isArray, parse, unwrap } from "../helpers.js";
import type { IModelSchema, ISchema, MixedType } from "../interface.js";

export interface Bind<T = unknown, R = unknown> extends PipeTransform<T, R> {
  (schema: ISchema): PipeTransform<T, R>;
}

class BindPipe<T = unknown, R = unknown> implements PipeTransform<T, R> {
  $schema: ISchema | undefined = undefined;
  constructor(schema?: ISchema) {
    this.$schema = schema;
  }
  transform(value: T, metadata: ArgumentMetadata): R {
    return innerTransform.call(this, value, metadata) as R;
  }
}

function createBindPipe(): Bind {
  const InnerPipe = function InnerPipe(schema?: ISchema) {
    return new BindPipe(schema);
  };
  InnerPipe.$schema = undefined;
  InnerPipe.transform = innerTransform;
  return InnerPipe;
}
export const Bind = createBindPipe();

const logger = new Logger("NestjsValidator");

function innerTransform(this: BindPipe, value: unknown, metadata: ArgumentMetadata): unknown {
  switch (metadata.type) {
    case "body":
    case "query":
    case "param":
      return transformValue(value, metadata, this.$schema);
    default:
      return value;
  }
}

function transformValue(plainValue: unknown, metadata: ArgumentMetadata, schema: ISchema | undefined) {
  const { metatype, type, data = "" } = metadata;
  schema = schema || getSchema(metatype);
  const path = data ? [type, data] : [type];
  if (schema) {
    const error = check(schema, plainValue);
    if (error) {
      error.path = path.concat(error.path);
      logger.warn(`The value for variable '${error.path.join(".")}' is invalid, message: ${error.message}.`);
      throw error;
    }
  }
  const instance = plainToInstance(plainValue, metatype || null, schema, path);
  return instance;
}

function plainToInstance(value: unknown, metaType: MixedType | null, schema: ISchema | undefined, path: string[]) {
  if (value === null) {
    return null;
  }

  if (value === undefined && schema) {
    value = getDefaultValue(schema);
  }

  let realMetaType: MixedType | null = metaType;
  if (!metaType && !schema) {
    logger.warn(`The type for variable '${path.join(".")}' must exist, otherwise the value will return 'undefined'.`);
    return undefined;
  }
  if (!metaType || (metaType === Object && schema)) {
    if (isArray(schema)) {
      realMetaType = Array;
    } else {
      realMetaType = getType(unwrap(schema));
    }
  }
  if (realMetaType === Object) {
    if (!schema) {
      logger.warn(
        `The type for variable '${path.join(".")}' must be explicit, don't use union type or intersection type, please use primitive types or class.`,
      );
      return undefined;
    }
    return createObject(value, Object, schema, path);
  }
  if (realMetaType === Array) {
    const _value = Array.isArray(value) ? value : [value];
    const _schema = unwrap(schema);
    const _type = getType(_schema);
    return _value.map((item, idx) => plainToInstance(item, _type, _schema, path.concat(idx.toString())));
  }
  if (realMetaType === String) {
    return String(value).trim();
  }
  if (realMetaType === Number) {
    return Number(value);
  }
  if (realMetaType === Boolean) {
    return !(
      value === false ||
      value === 0 ||
      value === "false" ||
      value === "0" ||
      value === null ||
      value === undefined ||
      value === "null" ||
      value === "undefined" ||
      value === "False"
    );
  }
  if (realMetaType === Date) {
    if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
    return undefined;
  }
  if (realMetaType === BigInt) {
    try {
      if (typeof value === "string" && value.at(-1) === "n") {
        return BigInt(value.slice(0, -1));
      }
      return BigInt(value as number | bigint);
    } catch (_error) {
      logger.warn(
        `The value for variable '${path.join(".")}' cannot be converted to BigInt, please input a valid number or string.`,
      );
      return undefined;
    }
  }
  // For duplicate binding case.
  if (realMetaType && value instanceof realMetaType) {
    return value;
  }
  return createObject(value, realMetaType as Type, schema, path);
}

function createObject<T extends object>(
  value: unknown,
  metaType: Type<T> | undefined,
  schema: ISchema | undefined,
  path: string[],
): T | null {
  if (value === null) {
    return null;
  }
  if (!metaType) {
    const [error, parsed] = parse<T>(schema as ISchema, value);
    if (error) {
      error.path = path.concat(error.path);
      logger.warn(`The value for variable '${error.path.join(".")}' is invalid, message: ${error.message}.`);
      throw error;
    }
    return parsed;
  }
  const instance = new metaType() as T;
  if (!schema) {
    return instance;
  }
  if (typeof value !== "object") {
    return instance;
  }
  const properties = getProperties(schema as IModelSchema);
  if (!properties) {
    return instance;
  }
  Object.values(properties).forEach((property) => {
    instance[property.name] = plainToInstance(value[property.name], null, property.schema, path.concat(property.name));
  });
  return instance;
}
