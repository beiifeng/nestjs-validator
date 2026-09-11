import type { IPlugin, IPluginCtx, IPluginRt } from "../interface.js";

const PLUGIN_NAME = "resolve-model-name-plugin";

export class ResolveModelNamePlugin implements IPlugin {
  static pluginName: string = PLUGIN_NAME;

  readonly type = "onModelApply";
  readonly name = PLUGIN_NAME;
  #definedModels: Set<string>;
  #splitter: string;
  constructor({ splitter }: { splitter?: string } = {}) {
    this.#definedModels = new Set<string>();
    this.#splitter = splitter ?? "_";
  }
  apply(_rt: IPluginRt, ctx?: IPluginCtx): IPluginCtx | undefined {
    if (!ctx) {
      return undefined;
    }
    let { name } = ctx;
    if (this.#definedModels.has(name)) {
      let count = 1;
      while (this.#definedModels.has(`${name}${this.#splitter}${count}`)) {
        count++;
      }
      name = `${name}${this.#splitter}${count}`;
      ctx.name = name;
    }
    this.#definedModels.add(name);
    return ctx;
  }
}
