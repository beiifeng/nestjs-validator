import type { IPlugin, IPluginRt } from "@beiifeng/nestjs-validator";
import { IsSchema } from "typebox";
import { validators } from "./store.js";

export class TypeBoxSchemaPlugin implements IPlugin {
  readonly type = "onModelInit";
  readonly name = "TypeBoxSchemaPlugin";
  apply({ schema }: IPluginRt): undefined {
    if (!IsSchema(schema)) {
      return;
    }
    validators.getOrInsert(schema);
  }
}
