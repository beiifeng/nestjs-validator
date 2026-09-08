import { hooks } from "./hooks/index.js";
import type { IAdapter, IPlugin, ISchema } from "./interface.js";
import { adapters } from "./store/index.js";

export const validator = {
  addAdapter: (adapter: IAdapter<ISchema>): void => {
    adapters.set(adapter.name, adapter);
  },
  addPlugin: (plugin: IPlugin): void => {
    hooks.tap(plugin);
  },
};
