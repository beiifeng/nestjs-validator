import type { IAdapter, IPlugin, ISchema } from "../interface";
import { hooks, validators } from "./store";

export const validator = {
  addAdapter: (adapter: IAdapter<ISchema>): void => {
    validators.set(adapter.name, adapter);
  },
  addPlugin: (plugin: IPlugin): void => {
    hooks.tap(plugin);
  },
};
