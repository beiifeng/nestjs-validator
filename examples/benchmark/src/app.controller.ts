import { Bind } from "@beiifeng/nestjs-validator";
import { Body, Controller, Logger, Post, StandardSchemaValidationPipe } from "@nestjs/common";
import { $tUserValidator, $ZUser, TUser, ZUser } from "./app.dto";

@Controller("app")
export class AppController {
  logger: Logger = new Logger(AppController.name);

  @Post("non-validator")
  nonValidator(@Body() _data: ZUser): number {
    return process.memoryUsage().heapUsed;
  }

  @Post("zod")
  testZod(@Body(Bind) _data: ZUser): number {
    return process.memoryUsage().heapUsed;
  }

  @Post("zod-non-transform")
  testZodNonTransform(@Body({ schema: $ZUser, pipes: [new StandardSchemaValidationPipe()] }) _data: ZUser): number {
    return process.memoryUsage().heapUsed;
  }

  @Post("typebox")
  testTypeBox(@Body(Bind) _data: TUser): number {
    return process.memoryUsage().heapUsed;
  }

  @Post("typebox-non-transform")
  testTypeBoxNonTransform(@Body() _data: TUser): number {
    $tUserValidator.Parse(_data);
    return process.memoryUsage().heapUsed;
  }
}
