import type { TSchema } from "typebox";
import Schema from "typebox/schema";

const STORE: Map<TSchema, Schema.Validator> = new Map();

export const validators = {
  has(schema: TSchema): boolean {
    return STORE.has(schema);
  },
  getOrInsert(schema: TSchema): Schema.Validator {
    let validator = STORE.get(schema);
    if (!validator) {
      validator = Schema.Compile(schema);
      STORE.set(schema, validator);
    }
    return validator;
  },
};
