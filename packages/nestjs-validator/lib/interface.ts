import type { TObject, TSchema } from "typebox";
import type { ZodObject, ZodType } from "zod";

export type ISchema = ZodType | TSchema;
export type IModelSchema = ZodObject | TObject;

export interface IProperty {
  name: string;
  schema: ISchema;
  required: boolean;
}
