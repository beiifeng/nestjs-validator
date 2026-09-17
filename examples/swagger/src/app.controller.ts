import { Bind } from "@beiifeng/nestjs-validator";
import { Body, Controller, Logger, Post } from "@nestjs/common";
import { TRole, TUser, ZRole, ZUser } from "./app.dto";

@Controller("app")
export class AppController {
  logger: Logger = new Logger(AppController.name);

  @Post("zod")
  testZodBody(@Body(Bind) data: ZUser): string {
    this.logger.log(`Received data: ${JSON.stringify(data)}`);
    this.logger.log(`Data is instance of ZUser: ${data instanceof ZUser}`);
    this.logger.log(`About: ${data.about()}`);
    if (data.roles?.length) {
      this.logger.log(`First role: ${JSON.stringify(data.roles[0])}`);
      this.logger.log(`First role is instance of ZRole: ${data.roles[0] instanceof ZRole}`);
      this.logger.log(`First role label name: ${data.roles[0].toLabelName()}`);
    }
    return "ok";
  }

  @Post("typebox")
  testTypeBoxBody(@Body(Bind) data: TUser): string {
    this.logger.log(`Received data: ${JSON.stringify(data)}`);
    this.logger.log(`Data is instance of TUser: ${data instanceof TUser}`);
    this.logger.log(`About: ${data.about()}`);
    if (data.roles?.length) {
      this.logger.log(`First role: ${JSON.stringify(data.roles[0])}`);
      this.logger.log(`First role is instance of TRole: ${data.roles[0] instanceof TRole}`);
      this.logger.log(`First role label name: ${data.roles[0].toLabelName()}`);
    }
    return "ok";
  }
}
