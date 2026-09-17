import { validator } from "@beiifeng/nestjs-validator";
import { NestjsValidatorPluginSwagger } from "@beiifeng/nestjs-validator-plugin-swagger";
import { TypeBoxAdapter } from "@beiifeng/nestjs-validator-typebox";
import { ZodAdapter } from "@beiifeng/nestjs-validator-zod";
import { NestFactory } from "@nestjs/core";

async function bootstrap() {
  validator.addAdapter(new TypeBoxAdapter());
  validator.addAdapter(new ZodAdapter());
  validator.addPlugin(new NestjsValidatorPluginSwagger());

  const { AppModule } = await import("./app.module");
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
