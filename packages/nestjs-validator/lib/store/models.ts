import type { Type } from "@nestjs/common";
import type { IModelSchema } from "../interface";

export const models = {
  mtos: new Map<Type, IModelSchema>(),
  stom: new Map<unknown, Type>(),
};
