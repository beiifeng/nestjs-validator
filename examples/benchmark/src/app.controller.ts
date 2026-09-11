import { Bind } from "@beiifeng/nestjs-validator";
import { Body, Controller, Logger, Post } from "@nestjs/common";
import { TUser, ZUser } from "./app.dto";

@Controller("app")
export class AppController {
  logger: Logger = new Logger(AppController.name);

  @Post("zod")
  testZod(@Body(Bind) _data: ZUser): number {
    return process.memoryUsage().heapUsed;
  }

  @Post("typebox")
  testTypeBox(@Body(Bind) _data: TUser): number {
    return process.memoryUsage().heapUsed;
  }
}
