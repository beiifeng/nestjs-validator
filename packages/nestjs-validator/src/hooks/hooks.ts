import type { IPlugin, IPluginCtx, IPluginRt, PluginType } from "../interface.js";

class Hooks {
  #hooks: Map<PluginType, Array<IPlugin>>;
  #hookTypes: PluginType[] = ["onModelZ", "onModelInit", "onModelApply"];
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

  call(type: Extract<PluginType, "onModelInit">, rt: IPluginRt): void;
  call(type: Exclude<PluginType, "onModelInit">, rt: IPluginRt, ctx: IPluginCtx): IPluginCtx;
  call(type: PluginType, rt: IPluginRt, ctx?: IPluginCtx): IPluginCtx | undefined {
    const plugins = this.#hooks.get(type);
    if (!plugins.length) {
      return ctx;
    }
    return plugins.reduce((prevCtx, plugin) => plugin.apply(rt, prevCtx) || prevCtx, ctx);
  }
}

export const hooks = new Hooks();
