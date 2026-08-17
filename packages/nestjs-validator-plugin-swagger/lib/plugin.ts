import type { IAdapter, IPlugin, IPluginCtx } from "@beiifeng/nestjs-validator";
import { ApiProperty, ApiSchema } from "@nestjs/swagger";

export class NestjsValidatorPluginSwagger implements IPlugin {
  readonly type = "doModel";
  readonly name = "NestjsValidatorPluginSwagger";
  apply(adapter: IAdapter<unknown>, schema: unknown, ctx: IPluginCtx): IPluginCtx {
    const { target, targetName, name } = ctx;
    if (targetName !== name) {
      ApiSchema({ name })(target);
    }
    const properties = adapter.getProperties(schema);
    Object.keys(properties).forEach((key) => {
      const property = properties[key];
      const { name, schema, required } = property;

      // TODO: complete the type mapping between validator and swagger
      ApiProperty({ name, required, type: adapter.native(schema) || Object })(target.prototype, key);
    });
    return ctx;
  }
}
