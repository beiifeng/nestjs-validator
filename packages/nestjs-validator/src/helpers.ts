import type { Type } from "@nestjs/common";
import type { IAdapter, IModelSchema, IModelZ, IProperty, ISchema, MixedType } from "./interface.js";
import { adapters, models } from "./store/index.js";

const schemaToAdapterCache = new Map<ISchema, IAdapter<ISchema>>();
export function getAdapter(schema: ISchema): IAdapter<ISchema> {
  const cachedAdapter = schemaToAdapterCache.get(schema);
  if (cachedAdapter) {
    return cachedAdapter;
  }
  for (const adapter of adapters.values()) {
    if (adapter.isSchema(schema)) {
      schemaToAdapterCache.set(schema, adapter);
      return adapter;
    }
  }
  throw new Error("No validator found for the given schema");
}

export function parse(schema: ISchema, plain: unknown): ReturnType<IAdapter<ISchema>["parse"]> {
  const eCtor = Error;
  const { stackTraceLimit } = eCtor;
  eCtor.stackTraceLimit = 0;
  try {
    return getAdapter(schema).parse(schema, plain);
  } finally {
    eCtor.stackTraceLimit = stackTraceLimit;
  }
}

export function check(schema: ISchema, value: unknown): ReturnType<IAdapter<ISchema>["check"]> {
  const eCtor = Error;
  const { stackTraceLimit } = eCtor;
  eCtor.stackTraceLimit = 0;
  try {
    return getAdapter(schema).check(schema, value);
  } finally {
    eCtor.stackTraceLimit = stackTraceLimit;
  }
}

export function getIdentifier(schema: ISchema): ReturnType<IAdapter<ISchema>["getIdentifier"]> {
  return getAdapter(schema).getIdentifier(schema);
}

export function getProperties(schema: ISchema): Record<string, IProperty<ISchema>> | null {
  return getAdapter(schema).getProperties(schema);
}

export function getDefaultValue(schema: ISchema): ReturnType<IAdapter<ISchema>["getDefaultValue"]> {
  return getAdapter(schema).getDefaultValue(schema);
}

export function getJSONSchema(schema: ISchema): ReturnType<IAdapter<ISchema>["getJSONSchema"]> {
  return getAdapter(schema).getJSONSchema(schema);
}

export function native(schema: ISchema): ReturnType<IAdapter<ISchema>["native"]> {
  return getAdapter(schema).native(schema);
}

export function isNull(schema: ISchema): ReturnType<IAdapter<ISchema>["isNull"]> {
  return getAdapter(schema).isNull(schema);
}

export function isArray(schema: ISchema): ReturnType<IAdapter<ISchema>["isArray"]> {
  return getAdapter(schema).isArray(schema);
}

export function isUndefined(schema: ISchema): ReturnType<IAdapter<ISchema>["isUndefined"]> {
  return getAdapter(schema).isUndefined(schema);
}

export function unwrap(schema: ISchema): ReturnType<IAdapter<ISchema>["unwrap"]> {
  return getAdapter(schema).unwrap(schema);
}

export function registerSchema(model: Type, schema: ISchema): void {
  Object.defineProperty(model, "$schema", {
    value: schema,
    writable: false,
    enumerable: false,
    configurable: false,
  });
}

export function getSchema(model: Type | undefined): IModelSchema | null {
  if (!model) {
    return null;
  }
  return (model as IModelZ<unknown>).$schema || null;
}

export function registerModel(schema: ISchema, model: Type): void {
  models.stom.set(getIdentifier(schema), model);
}

export function getModel(schema: ISchema): Type | null {
  if (!schema) {
    return null;
  }
  return models.stom.get(getIdentifier(schema)) || null;
}

export function getType(schema: ISchema): MixedType | null {
  if (!schema) {
    return null;
  }
  const nativeType = native(schema);
  if (nativeType === Object || nativeType === null) {
    return getModel(schema) || nativeType;
  }
  return nativeType;
}
