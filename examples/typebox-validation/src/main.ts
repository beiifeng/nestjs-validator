import { validator } from "@beiifeng/nestjs-validator";
import { TypeBoxAdapter } from "@beiifeng/nestjs-validator-typebox";

import { NestFactory } from "@nestjs/core";

async function bootstrap() {
  validator.addAdapter(new TypeBoxAdapter());
  const { AppModule } = await import("./app.module");
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
