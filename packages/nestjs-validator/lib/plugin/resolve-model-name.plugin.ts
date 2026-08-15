import type { IAdapter, IPlugin, IPluginCtx, ISchema, PluginType } from "../interface";

export class ResolveModelNamePlugin implements IPlugin {
  readonly type = "doModel" as const satisfies PluginType;
  readonly name = "ResolveModelNamePlugin";

  #definedModels: Set<string>;
  #splitter: string;
  constructor() {
    this.#definedModels = new Set<string>();
    this.#splitter = "_";
  }
  async apply(_adapter: IAdapter<ISchema>, _schema: ISchema, ctx: IPluginCtx): Promise<IPluginCtx> {
    let { targetName } = ctx;
    let count = 1;
    if (this.#definedModels.has(targetName)) {
      while (this.#definedModels.has(`${targetName}${this.#splitter}${count}`)) {
        count++;
      }
      targetName = `${targetName}${this.#splitter}${count}`;
    }
    this.#definedModels.add(targetName);
    ctx.targetName = targetName;
    return ctx;
  }
}
