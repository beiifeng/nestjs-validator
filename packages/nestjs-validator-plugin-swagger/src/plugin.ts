import type { IPlugin, IPluginCtx, IPluginRt } from "@beiifeng/nestjs-validator";
import { ApiProperty, ApiSchema } from "@nestjs/swagger";

export class NestjsValidatorPluginSwagger implements IPlugin {
  readonly type = "onModelApply";
  readonly name = "NestjsValidatorPluginSwagger";
  apply({ adapter, schema, getType }: IPluginRt, ctx: IPluginCtx): IPluginCtx {
    const { target, targetName, name, description } = ctx;
    if (targetName !== name || description) {
      ApiSchema({ name, description })(target);
    }
    const properties = adapter.getProperties(schema);
    Object.keys(properties).forEach((key) => {
      const property = properties[key];
      const { name, schema, required, description, example, examples } = property;

      const isArray = adapter.native(schema) === Array;
      const type = getType(adapter.unwrap(schema)) || Object;
      const enumValues = adapter.getEnumValues(schema) || undefined;

      ApiProperty({
        name,
        type,
        isArray,
        required,
        enum: enumValues,
        description,
        example,
        examples,
      })(target.prototype, key);
    });
    return ctx;
  }
}
