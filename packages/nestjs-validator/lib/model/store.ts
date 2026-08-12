import type { Type } from "@nestjs/common";
import type { AcceptedModelSchema } from "../interface";
import { getSchemaIdentifier } from "../validator";

const modelMapSchema = new Map<Type, AcceptedModelSchema>();
const schemaMapModel = new Map<unknown, Type>();

export const MODEL_SCHEMA = {
  set: (model: Type, schema: AcceptedModelSchema) => {
    modelMapSchema.set(model, schema);
    schemaMapModel.set(getSchemaIdentifier(schema), model);
  },
  getSchema: (model: Type) => {
    return modelMapSchema.get(model);
  },
  getModel: (schema: AcceptedModelSchema) => {
    return schemaMapModel.get(getSchemaIdentifier(schema));
  },
};
