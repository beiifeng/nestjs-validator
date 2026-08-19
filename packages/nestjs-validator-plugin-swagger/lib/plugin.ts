import type { IPlugin, IPluginCtx, IPluginRt } from "@beiifeng/nestjs-validator";
import { ApiProperty, ApiSchema } from "@nestjs/swagger";

export class NestjsValidatorPluginSwagger implements IPlugin {
  readonly type = "doModel";
  readonly name = "NestjsValidatorPluginSwagger";
  apply({ adapter, schema, getType }: IPluginRt, ctx: IPluginCtx): IPluginCtx {
    const { target, targetName, name } = ctx;
    if (targetName !== name) {
      ApiSchema({ name })(target);
    }
    const properties = adapter.getProperties(schema);
    Object.keys(properties).forEach((key) => {
      const property = properties[key];
      const { name, schema, required } = property;

      const isArray = adapter.native(schema) === Array;
      const type = getType(adapter.unwrap(schema)) || Object;

      ApiProperty({ name, required, type, isArray })(target.prototype, key);
    });
    return ctx;
  }
}
