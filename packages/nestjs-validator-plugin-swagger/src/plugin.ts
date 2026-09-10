import {
  type IPlugin,
  type IPluginCtx,
  type IPluginRt,
  ResolveModelNamePlugin,
  validator,
} from "@beiifeng/nestjs-validator";
import { ApiProperty, ApiSchema } from "@nestjs/swagger";

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
