import type { Static, TObject, TProperties } from "typebox";
import type { ZodObject, output as ZodOutput, ZodType } from "zod";
import { parseToPlain } from "../validator/helpers";

export interface ModelZ<T> {
  new (): T;
  new (plain: Partial<T>): T;
}

export function ModelZ<T extends Record<string, ZodType>>(schema: ZodObject<T>): ModelZ<ZodOutput<typeof schema>>;
export function ModelZ<T extends TProperties>(schema: TObject<T>): ModelZ<Static<typeof schema>>;
export function ModelZ(schema: ZodObject | TObject) {
  class InnerModel {
    constructor(plain?: Record<string, unknown>) {
      if (plain) {
        const parsed = parseToPlain(schema, plain);
        this.initialize(parsed as Record<string, unknown>);
      }
    }
    initialize(plain: Record<string, unknown>) {
      Object.assign(this, plain);
    }
  }
  return InnerModel as ModelZ<unknown>;
}
