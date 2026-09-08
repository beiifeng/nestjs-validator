import { validator } from "@beiifeng/nestjs-validator";
import { ZodAdapter } from "@beiifeng/nestjs-validator-zod";
import { NestFactory } from "@nestjs/core";

async function bootstrap() {
  validator.addAdapter(new ZodAdapter());
  const { AppModule } = await import("./app.module");
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
