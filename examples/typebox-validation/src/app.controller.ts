import { Bind } from "@beiifeng/nestjs-validator";
import { Body, Controller, Get, Logger, Param, Post, Query } from "@nestjs/common";
import { Role, User } from "./app.dto";
import t from "typebox";

@Controller("test")
export class AppController {
  logger: Logger = new Logger(AppController.name);

  @Post("body")
  testBody(@Body(Bind) data: User): string {
    this.logger.log(`Received data: ${JSON.stringify(data)}`);
    this.logger.log(`User instance: ${data instanceof User}`);
    if (data.roles?.length) {
      this.logger.log(`User roles instance: ${data.roles[0] instanceof Role}`);
    }
    return "ok";
  }

  @Get("param/:id")
  testGet(@Param("id", Bind(t.String({ format: "uuid" }))) type: string): string {
    this.logger.log(`Received type: ${type}`);
    return "ok";
  }

  @Get("query")
  testQuery(
    @Query(Bind) role: Role,
    @Query("code", Bind(t.Optional(t.String({ maxLength: 10 })))) code: string,
  ): string {
    this.logger.log(`Received is role: ${role instanceof Role}`);
    this.logger.log(`Received role: ${JSON.stringify(role)}`);
    this.logger.log(`Received code: ${code}`);
    return "ok";
  }
}
