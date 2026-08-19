import { hooks } from "./hooks";
import type { IAdapter, IPlugin, ISchema } from "./interface";
import { adapters } from "./store";

export const validator = {
  addAdapter: (adapter: IAdapter<ISchema>): void => {
    adapters.set(adapter.name, adapter);
  },
  addPlugin: (plugin: IPlugin): void => {
    hooks.tap(plugin);
  },
};
