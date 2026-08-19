import { BadRequestException, Logger, type ArgumentMetadata, type PipeTransform, type Type } from "@nestjs/common";
import { check, getProperties, getSchema, getType, parse, unwrap } from "../helpers";
import type { IModelSchema, ISchema, MixedType } from "../interface";

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
  const instance = plainToInstance(plainValue, metatype, schema, `${type}:${data}`);
  if (schema) {
    const valid = check(schema, instance);
    if (!valid) {
      logger.warn(`The value for variable '${type}:${data}' is invalid, please check the schema.`);
      throw new BadRequestException(`The value for variable '${type}:${data}' is invalid, please check the schema.`);
    }
  }
  return instance;
}

function plainToInstance(value: unknown, metaType: MixedType | null, schema: ISchema | undefined, path: string) {
  if (value === null || value === undefined) {
    return value;
  }

  let realMetaType: MixedType = metaType;
  if (!metaType && !schema) {
    logger.warn(`The type for variable '${path}' must exist, otherwise the value will return 'undefined'.`);
    return undefined;
  }
  if (!metaType || (metaType === Object && schema)) {
    const _schema = unwrap(schema);
    realMetaType = getType(_schema);
  }
  if (realMetaType === Object) {
    if (!schema) {
      logger.warn(
        `The type for variable '${path}' must be explicit, don't use union type or intersection type, please use primitive types or class.`,
      );
      return undefined;
    }
    return createInstance(value, Object, schema, path);
  }
  if (realMetaType === Array) {
    const _value = Array.isArray(value) ? value : [value];
    const _schema = unwrap(schema);
    const _type = getType(_schema);
    return _value.map((item, idx) => plainToInstance(item, _type, _schema, `${path}.[${idx}]`));
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
      return BigInt(value as string | number);
    } catch (_error) {
      logger.warn(`The value for variable '${path}' cannot be converted to BigInt, please check the schema.`);
      return undefined;
    }
  }
  // For duplicate binding case.
  if (realMetaType && value instanceof realMetaType) {
    return value;
  }
  return createInstance(value, realMetaType as Type, schema, path);
}

function createInstance<T extends object>(
  value: unknown,
  metaType: Type<T>,
  schema: ISchema | undefined,
  path: string,
): T {
  if (!metaType) {
    return parse(schema as ISchema, value) as T;
  }
  const instance = new metaType() as T;
  if (!schema) {
    return instance;
  }
  const properties = getProperties(schema as IModelSchema);
  if (!properties) {
    return instance;
  }
  Object.values(properties).forEach((property) => {
    Reflect.set(
      instance,
      property.name,
      plainToInstance(value[property.name], null, property.schema, `${path}.${property.name}`),
    );
  });
  return instance;
}
