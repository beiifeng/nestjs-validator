import type { Type } from "@nestjs/common";
import type { IModelSchema, ISchema } from "../interface";
import { getNativeType, getSchemaIdentifier } from "../validator/helpers";

const modelMapSchema = new Map<Type, IModelSchema>();
const schemaMapModel = new Map<unknown, Type>();

export const MODEL_SCHEMA = {
  set: (model: Type, schema: IModelSchema) => {
    modelMapSchema.set(model, schema);
    schemaMapModel.set(getSchemaIdentifier(schema), model);
  },
  getSchema: (model: Type) => {
    return model ? modelMapSchema.get(model) : null;
  },
  getModel: (schema: ISchema) => {
    if (!schema) {
      return null;
    }
    const nativeType = getNativeType(schema);
    if (nativeType === Object) {
      return schemaMapModel.get(getSchemaIdentifier(schema)) || Object;
    }
    return nativeType;
  },
};
