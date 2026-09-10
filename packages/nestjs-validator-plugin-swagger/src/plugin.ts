import {
  ResolveModelNamePlugin,
  validator,
  type IPlugin,
  type IPluginCtx,
  type IPluginRt,
} from "@beiifeng/nestjs-validator";
import { ApiProperty, ApiSchema, type ApiPropertyOptions } from "@nestjs/swagger";

const PLUGIN_NAME = "nestjs-validator-plugin-swagger";

export class NestjsValidatorPluginSwagger implements IPlugin {
  readonly type = "onModelApply";
  readonly name = PLUGIN_NAME;

  constructor() {
    validator.addPlugin(new ResolveModelNamePlugin());
  }

  apply({ adapter, schema, getType }: IPluginRt, ctx?: IPluginCtx): IPluginCtx | undefined {
    if (!ctx) {
      return undefined;
    }
    const { target, targetName, name, description } = ctx;
    if (targetName !== name || description) {
      ApiSchema({ name, description })(target);
    }
    const properties = adapter.getProperties(schema);
    if (!properties) {
      return ctx;
    }
    Object.keys(properties).forEach((key) => {
      const property = properties[key];
      const { schema, ...others } = property;

      const type = getType(adapter.unwrap(schema)) || Object;
      const isArray = adapter.native(schema) === Array;
      const enumValues = adapter.getEnumValues(schema) || undefined;

      ApiProperty({
        type,
        isArray,
        enum: enumValues,
        ...others,
      } as ApiPropertyOptions)(target.prototype, key);
    });
    return ctx;
  }
}
