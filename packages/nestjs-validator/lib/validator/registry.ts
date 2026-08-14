import type { IAdapter } from "../interface";
import { validatorStore } from "./store";

export const validator = {
  register: (name: string, adapter: IAdapter): void => {
    validatorStore.set(name, adapter);
  },
  unregister: (name: string): void => {
    validatorStore.delete(name);
  },
};
