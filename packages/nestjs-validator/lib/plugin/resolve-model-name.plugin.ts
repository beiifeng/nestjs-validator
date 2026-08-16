import type { IAdapter, IPlugin, IPluginCtx, ISchema } from "../interface";

export class ResolveModelNamePlugin implements IPlugin {
  readonly type = "doModel";
  readonly name = "ResolveModelNamePlugin";
  #definedModels: Set<string>;
  #splitter: string;
  constructor() {
    this.#definedModels = new Set<string>();
    this.#splitter = "_";
  }
  apply(_adapter: IAdapter<ISchema>, _schema: ISchema, ctx: IPluginCtx): IPluginCtx {
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
