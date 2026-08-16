import type { IAdapter, IProperty, ISchema } from "../interface";
import { validators } from "./store";

const schemaToAdapterCache = new Map<ISchema, IAdapter<ISchema>>();
export function getAdapter(schema: ISchema): IAdapter<ISchema> {
  const cachedAdapter = schemaToAdapterCache.get(schema);
  if (cachedAdapter) {
    return cachedAdapter;
  }
  for (const adapter of validators.values()) {
    if (adapter.isSchema(schema)) {
      schemaToAdapterCache.set(schema, adapter);
      return adapter;
    }
  }
  throw new Error("No validator found for the given schema");
}

export function parseToPlain(schema: ISchema, plain: unknown): ReturnType<IAdapter<ISchema>["parse"]> {
  return getAdapter(schema).parse(schema, plain);
}

export function checkValue(schema: ISchema, value: unknown): ReturnType<IAdapter<ISchema>["check"]> {
  return getAdapter(schema).check(schema, value);
}

export function getSchemaIdentifier(schema: ISchema): ReturnType<IAdapter<ISchema>["getIdentifier"]> {
  return getAdapter(schema).getIdentifier(schema);
}

export function getSchemaProperties(schema: ISchema): Record<string, IProperty<ISchema> | null> {
  return getAdapter(schema).getProperties(schema);
}

export function getNativeType(schema: ISchema): ReturnType<IAdapter<ISchema>["native"]> {
  return getAdapter(schema).native(schema);
}

export function isNullSchema(schema: ISchema): ReturnType<IAdapter<ISchema>["isNull"]> {
  return getAdapter(schema).isNull(schema);
}

export function isUndefinedSchema(schema: ISchema): ReturnType<IAdapter<ISchema>["isUndefined"]> {
  return getAdapter(schema).isUndefined(schema);
}

export function unwrapSchema(schema: ISchema): ReturnType<IAdapter<ISchema>["unwrap"]> {
  return getAdapter(schema).unwrap(schema);
}
