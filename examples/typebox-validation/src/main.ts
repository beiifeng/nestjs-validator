import { validator } from "@beiifeng/nestjs-validator";
import { TypeBoxAdapter } from "@beiifeng/nestjs-validator-typebox";
validator.register("TypeBox", new TypeBoxAdapter());

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
