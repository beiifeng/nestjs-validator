import type { IAdapter, ISchema, IProperty } from "../interface";
import { validatorStore } from "./store";

const schemaToAdapterCache = new Map<ISchema, IAdapter>();
export function getValidator(schema: ISchema): IAdapter {
  const cachedAdapter = schemaToAdapterCache.get(schema);
  if (cachedAdapter) {
    return cachedAdapter;
  }
  for (const adapter of validatorStore.values()) {
    if (adapter.isSchema(schema)) {
      schemaToAdapterCache.set(schema, adapter);
      return adapter;
    }
  }
  throw new Error("No validator found for the given schema");
}

export function parseToPlain(schema: ISchema, plain: unknown): ReturnType<IAdapter["parse"]> {
  return getValidator(schema).parse(schema, plain);
}

export function checkValue(schema: ISchema, value: unknown): ReturnType<IAdapter["check"]> {
  return getValidator(schema).check(schema, value);
}

export function getSchemaIdentifier(schema: ISchema): ReturnType<IAdapter["getIdentifier"]> {
  return getValidator(schema).getIdentifier(schema);
}

export function getSchemaProperties(schema: ISchema): Record<string, IProperty<ISchema> | null> {
  return getValidator(schema).getProperties(schema);
}

export function getNativeType(schema: ISchema): ReturnType<IAdapter["native"]> {
  return getValidator(schema).native(schema);
}

export function isNullSchema(schema: ISchema): ReturnType<IAdapter["isNull"]> {
  return getValidator(schema).isNull(schema);
}

export function isUndefinedSchema(schema: ISchema): ReturnType<IAdapter["isUndefined"]> {
  return getValidator(schema).isUndefined(schema);
}

export function unwrapSchema(schema: ISchema): ReturnType<IAdapter["unwrap"]> {
  return getValidator(schema).unwrap(schema);
}
