import type { IAdapter, ISchema } from "../interface";

export const validatorStore = new Map<string, IAdapter<ISchema>>();
