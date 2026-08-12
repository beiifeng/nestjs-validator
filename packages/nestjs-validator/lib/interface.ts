import type { TObject, TSchema } from "typebox";
import type { ZodObject, ZodType } from "zod";

export type AcceptedSchema = ZodType | TSchema;
export type AcceptedModelSchema = ZodObject | TObject;
