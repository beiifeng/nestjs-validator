import type { HookType, IAdapter, IHook, IHookCtx, ISchema } from "../interface";

export class ResolveModelNamePlugin implements IHook {
  readonly type = "doModel" as const satisfies HookType;
  readonly name = "ResolveModelNamePlugin";

  #definedModels: Set<string>;
  #splitter: string;
  constructor() {
    this.#definedModels = new Set<string>();
    this.#splitter = "_";
  }
  async apply<S extends ISchema>(_adapter: IAdapter<S>, _schema: S, ctx: IHookCtx): Promise<IHookCtx> {
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
