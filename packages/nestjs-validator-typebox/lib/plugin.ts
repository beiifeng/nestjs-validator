import type { IPlugin, IPluginRuntime } from "@beiifeng/nestjs-validator";
import { IsSchema } from "typebox";
import Schema from "typebox/schema";
import { schemaValidator } from "./store";

export class TypeBoxSchemaCheckerPlugin implements IPlugin {
  readonly type = "onModel";
  readonly name = "TypeBoxSchemaCheckerPlugin";
  apply({ schema }: IPluginRuntime): void {
    if (!IsSchema(schema)) {
      return;
    }
    if (!schemaValidator.has(schema)) {
      schemaValidator.set(schema, Schema.Compile(schema));
    }
  }
}
