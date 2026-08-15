import { Body, Controller, Logger, Post } from "@nestjs/common";
import { Role, User } from "./app.dto";
import { AppService } from "./app.service";
import { Bind } from "@beiifeng/nestjs-validator";

@Controller()
export class AppController {
  logger: Logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Post()
  getHello(@Body(Bind) data: User): string {
    this.logger.log(`Received data: ${JSON.stringify(data)}`);
    this.logger.log(`User instance: ${data instanceof User}`);
    if (data.roles?.length) {
      this.logger.log(`User roles instance: ${data.roles[0] instanceof Role}`);
    }
    return "ok";
  }
}
