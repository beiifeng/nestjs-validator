import type { IModelSchema, IProperty, ISchema } from "../interface";
import type { ValidatorAdapter } from "./adapter";
import { validatorStore } from "./store";

const schemaToAdapterCache = new WeakMap<ISchema, ValidatorAdapter>();
export function getValidator(schema: ISchema): ValidatorAdapter {
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

export function parseToPlain(schema: ISchema, plain: unknown): unknown {
  return getValidator(schema).parse(schema, plain);
}

export function checkValue(schema: ISchema, value: unknown): boolean {
  return getValidator(schema).check(schema, value);
}

export function getSchemaIdentifier(schema: ISchema): unknown {
  return getValidator(schema).getIdentifier(schema);
}

export function getSchemaProperties(schema: IModelSchema): Record<string, IProperty> | null {
  return getValidator(schema).getProperties(schema);
}

export function getNativeType(
  schema: ISchema,
):
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | ArrayConstructor
  | ObjectConstructor
  | null {
  return getValidator(schema).nativeType(schema);
}

export function isNullSchema(schema: ISchema): boolean {
  return getValidator(schema).isNull(schema);
}

export function isUndefinedSchema(schema: ISchema): boolean {
  return getValidator(schema).isUndefined(schema);
}

export function unwrapSchema(schema: ISchema): ISchema {
  return getValidator(schema).unwrap(schema);
}
