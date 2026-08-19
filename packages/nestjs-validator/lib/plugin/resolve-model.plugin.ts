import type { IPlugin, IPluginCtx, IPluginRt } from "../interface";

export class ResolveModelPlugin implements IPlugin {
  readonly type = "doModel";
  readonly name = "ResolveModelPlugin";
  #definedModels: Set<string>;
  #splitter: string;
  constructor({ splitter }: { splitter?: string } = {}) {
    this.#definedModels = new Set<string>();
    this.#splitter = splitter ?? "_";
  }
  apply(_rt: IPluginRt, ctx: IPluginCtx): IPluginCtx {
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
