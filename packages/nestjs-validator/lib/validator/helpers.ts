import type { AcceptedModelSchema, AcceptedSchema } from "../interface";
import type { ValidatorAdapter } from "./adapter";
import { validatorStore } from "./store";

const schemaToAdapterCache = new WeakMap<AcceptedModelSchema, ValidatorAdapter>();
export function getValidator(schema: AcceptedModelSchema): ValidatorAdapter {
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

export function parseToPlain(schema: AcceptedModelSchema, plain: unknown): unknown {
  return getValidator(schema).parse(schema, plain);
}

export function getSchemaIdentifier(schema: AcceptedModelSchema): unknown {
  return getValidator(schema).getIdentifier(schema);
}

export function getSchemaProperties(
  schema: AcceptedModelSchema,
): Record<string, { name: string; schema: AcceptedSchema; required: boolean }> | null {
  return getValidator(schema).getProperties(schema);
}
