import type { Type } from "@nestjs/common";
import type { IAdapter, IModelSchema, IProperty, ISchema, MixedType } from "./interface";
import { adapters, models } from "./store";

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
  return getAdapter(schema).parse(schema, plain);
}

export function check(schema: ISchema, value: unknown): ReturnType<IAdapter<ISchema>["check"]> {
  return getAdapter(schema).check(schema, value);
}

export function getIdentifier(schema: ISchema): ReturnType<IAdapter<ISchema>["getIdentifier"]> {
  return getAdapter(schema).getIdentifier(schema);
}

export function getProperties(schema: ISchema): Record<string, IProperty<ISchema> | null> {
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

export function isUndefined(schema: ISchema): ReturnType<IAdapter<ISchema>["isUndefined"]> {
  return getAdapter(schema).isUndefined(schema);
}

export function unwrap(schema: ISchema): ReturnType<IAdapter<ISchema>["unwrap"]> {
  return getAdapter(schema).unwrap(schema);
}

export function registerModelSchema(model: Type, schema: ISchema): void {
  models.mtos.set(model, schema);
  models.stom.set(getIdentifier(schema), model);
}

export function getSchema(model: Type): IModelSchema | null {
  if (!model) {
    return null;
  }
  return models.mtos.get(model) || null;
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
