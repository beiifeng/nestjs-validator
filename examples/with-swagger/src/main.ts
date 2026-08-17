import { validator } from "@beiifeng/nestjs-validator";
import { NestjsValidatorPluginSwagger } from "@beiifeng/nestjs-validator-plugin-swagger";
import { ZodAdapter } from "@beiifeng/nestjs-validator-zod";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  validator.addAdapter(new ZodAdapter());
  validator.addPlugin(new NestjsValidatorPluginSwagger());
  const { AppModule } = await import("./app.module");
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Example")
    .setDescription("The API description")
    .setVersion("1.0")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
