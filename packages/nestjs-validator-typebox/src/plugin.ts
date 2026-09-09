import type { IPlugin, IPluginRt } from "@beiifeng/nestjs-validator";
import { IsSchema } from "typebox";
import { validators } from "./store.js";

const PLUGIN_NAME = "typebox-schema-plugin";

export class TypeBoxSchemaPlugin implements IPlugin {
  readonly type = "onModelInit";
  readonly name = PLUGIN_NAME;
  apply({ schema }: IPluginRt): undefined {
    if (!IsSchema(schema)) {
      return;
    }
    validators.getOrInsert(schema);
  }
}
