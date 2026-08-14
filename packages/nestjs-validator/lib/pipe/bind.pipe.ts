import { BadRequestException, Logger, type ArgumentMetadata, type PipeTransform, type Type } from "@nestjs/common";
import type { IModelSchema, ISchema } from "../interface";
import { MODEL_SCHEMA } from "../model/store";
import { checkValue, getSchemaProperties, parseToPlain, unwrapSchema } from "../validator/helpers";

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

const logger = new Logger("NestjsValidator:BindPipe");

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
  schema = schema || MODEL_SCHEMA.getSchema(metatype);
  const instance = plainToInstance(plainValue, metatype, schema, `${type}:${data}`);
  if (schema) {
    const valid = checkValue(schema, instance);
    if (!valid) {
      logger.warn(`The value for variable '${type}:${data}' is invalid, please check the schema.`);
      throw new BadRequestException(`The value for variable '${type}:${data}' is invalid, please check the schema.`);
    }
  }
  return instance;
}

function plainToInstance(value: unknown, metaType: Type | null, schema: ISchema | undefined, path: string) {
  if (value === null || value === undefined) {
    return value;
  }

  let realMetaType: Type = metaType as Type;
  if (!realMetaType) {
    realMetaType = MODEL_SCHEMA.getModel(schema);
  }
  if (!realMetaType && !schema) {
    logger.warn(`The type for variable '${path}' must exist, otherwise the value will return 'undefined'.`);
    return undefined;
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
    const _schema = unwrapSchema(schema);
    const _type = MODEL_SCHEMA.getModel(_schema);
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
  // For duplicate binding case.
  if (realMetaType && value instanceof realMetaType) {
    return value;
  }
  return createInstance(value, realMetaType, schema, path);
}

function createInstance<T extends object>(
  value: unknown,
  metaType: Type<T>,
  schema: ISchema | undefined,
  path: string,
): T {
  if (!metaType) {
    return parseToPlain(schema as ISchema, value) as T;
  }
  const instance = new metaType() as T;
  if (!schema) {
    return instance;
  }
  const properties = getSchemaProperties(schema as IModelSchema);
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
