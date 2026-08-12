import type { ValidatorAdapter } from "./adapter";
import { validatorStore } from "./store";

export const validatorRegistry = {
  register: (name: string, adapter: ValidatorAdapter): void => {
    validatorStore.set(name, adapter);
  },
  unregister: (name: string): void => {
    validatorStore.delete(name);
  },
};
