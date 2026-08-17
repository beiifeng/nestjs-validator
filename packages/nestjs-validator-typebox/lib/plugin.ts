import type { IAdapter, IPlugin } from "@beiifeng/nestjs-validator";
import { IsSchema, type TSchema } from "typebox";
import Schema from "typebox/schema";
import { schemaValidator } from "./store";

export class TypeBoxSchemaCheckerPlugin implements IPlugin {
  readonly type = "onModel";
  readonly name = "TypeBoxSchemaCheckerPlugin";
  apply(_adapter: IAdapter<TSchema>, schema: TSchema): void {
    if (!IsSchema(schema)) {
      return;
    }
    if (!schemaValidator.has(schema)) {
      schemaValidator.set(schema, Schema.Compile(schema));
    }
  }
}
