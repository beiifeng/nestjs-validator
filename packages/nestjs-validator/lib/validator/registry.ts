import type { IAdapter, ISchema } from "../interface";
import { validatorStore } from "./store";

export const validator = {
  register: (name: string, adapter: IAdapter<ISchema>): void => {
    validatorStore.set(name, adapter);
  },
};
