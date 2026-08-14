import { NestFactory } from "@nestjs/core";
import { validatorRegistry } from "@beiifeng/nestjs-validator";
import { ZodAdapter } from "@beiifeng/nestjs-validator-zod";
validatorRegistry.register("Zod", new ZodAdapter());

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
