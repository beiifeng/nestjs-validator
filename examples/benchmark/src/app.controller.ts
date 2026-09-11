import { Bind } from "@beiifeng/nestjs-validator";
import { Body, Controller, Logger, Post } from "@nestjs/common";
import { TUser, ZUser } from "./app.dto";

@Controller("app")
export class AppController {
  logger: Logger = new Logger(AppController.name);

  @Post("zod")
  testZod(@Body(Bind) data: ZUser): string {
    return JSON.stringify(data);
  }

  @Post("typebox")
  testTypeBox(@Body(Bind) data: TUser): string {
    return JSON.stringify(data);
  }
}
