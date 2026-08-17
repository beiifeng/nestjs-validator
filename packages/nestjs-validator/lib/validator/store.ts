import type { IAdapter, IPlugin, IPluginModelCtx, IPluginRuntime, ISchema, PluginType } from "../interface";

export const validators = new Map<string, IAdapter<ISchema>>();

class Hooks {
  #hooks: Map<PluginType, Array<IPlugin>>;
  #hookTypes: PluginType[] = ["onModel", "doModel", "onModelZ"];
  constructor() {
    this.#hooks = new Map<PluginType, Array<IPlugin>>(this.#hookTypes.map((type) => [type, []]));
  }

  tap(plugin: IPlugin): void {
    if (!this.#hookTypes.includes(plugin.type)) {
      throw new Error(`Invalid plugin type: ${plugin.type}`);
    }
    if (this.#hooks.get(plugin.type).every((p) => p.name !== plugin.name)) {
      this.#hooks.get(plugin.type).push(plugin);
    }
  }

  call(type: Extract<PluginType, "doModel">, runtime: IPluginRuntime, ctx: IPluginModelCtx): IPluginModelCtx;
  call(type: Exclude<PluginType, "doModel">, runtime: IPluginRuntime): void;
  call(type: PluginType, runtime: IPluginRuntime, ctx?: IPluginModelCtx): IPluginModelCtx | undefined {
    const plugins = this.#hooks.get(type);
    if (!plugins.length) {
      return ctx;
    }
    return plugins.reduce((prevCtx, plugin) => plugin.apply(runtime, prevCtx) || prevCtx, ctx);
  }
}

export const hooks = new Hooks();
