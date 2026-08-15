import type { IAdapter, IPlugin, ISchema } from "../interface";
import { validatorStore } from "./store";

export const validator = {
  addAdapter: (adapter: IAdapter<ISchema>): void => {
    validatorStore.set(adapter.name, adapter);
  },
  addPlugin: (plugin: IPlugin): void => {},
};
