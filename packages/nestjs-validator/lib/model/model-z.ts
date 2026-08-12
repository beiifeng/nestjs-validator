import type { Static, TObject, TProperties } from "typebox";
import type { ZodObject, output as ZodOutput, ZodType } from "zod";
import { parseToPlain } from "../validator";

export interface ModelType<T> {
  new (): T;
  new (plain: Partial<T>): T;
}

export function ModelZ<T extends Record<string, ZodType>>(schema: ZodObject<T>): ModelType<ZodOutput<typeof schema>>;
export function ModelZ<T extends TProperties>(schema: TObject<T>): ModelType<Static<typeof schema>>;
export function ModelZ(schema: ZodObject | TObject) {
  class ModelZ {
    constructor(plain?: Record<string, unknown>) {
      if (plain) {
        const parsed = parseToPlain(schema, plain);
        Object.assign(this, parsed);
      }
    }
  }
  return ModelZ as ModelType<unknown>;
}
