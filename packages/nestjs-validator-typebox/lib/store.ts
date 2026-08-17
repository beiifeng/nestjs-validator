import type { TSchema } from "typebox";
import type Schema from "typebox/schema";

export const schemaValidator: Map<TSchema, Schema.Validator> = new Map();
