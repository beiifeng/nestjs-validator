import type { IPlugin, IPluginModelCtx, IPluginRuntime } from "../interface";

export class ResolveModelNamePlugin implements IPlugin {
  readonly type = "doModel";
  readonly name = "ResolveModelNamePlugin";
  #definedModels: Set<string>;
  #splitter: string;
  constructor() {
    this.#definedModels = new Set<string>();
    this.#splitter = "_";
  }
  apply(_runtime: IPluginRuntime, ctx: IPluginModelCtx): IPluginModelCtx {
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
