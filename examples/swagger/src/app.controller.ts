import { Bind } from "@beiifeng/nestjs-validator";
import { Body, Controller, Get, Logger, Param, Post, Query } from "@nestjs/common";
import z from "zod";
import { Order, Role, User } from "./app.dto";

@Controller("app")
export class AppController {
  logger: Logger = new Logger(AppController.name);

  @Post("body")
  testBody(@Body(Bind) data: User): string {
    this.logger.log(`Received data: ${JSON.stringify(data)}`);
    this.logger.log(`User instance: ${data instanceof User}`);
    this.logger.log(`User created at: ${data.createdAt instanceof Date}`);
    if (data.roles?.length) {
      this.logger.log(`User roles instance: ${data.roles[0] instanceof Role}`);
    }
    return "ok";
  }

  @Get("param/:id")
  testGet(@Param("id", Bind(z.uuid())) type: string): string {
    this.logger.log(`Received type: ${type}`);
    return "ok";
  }

  @Get("query")
  testQuery(
    @Query(Bind) role: Role,
    @Query("code", Bind(z.string().max(10).optional())) code?: string | undefined,
  ): string {
    this.logger.log(`Received is role: ${role instanceof Role}`);
    this.logger.log(`Received role: ${JSON.stringify(role)}`);
    this.logger.log(`Received code: ${JSON.stringify(code)}`);
    return "ok";
  }

  @Post("order")
  testOrder(@Body(Bind) order: Order): string {
    this.logger.log(`Received order: ${JSON.stringify(order)}`);
    this.logger.log(`Order instance: ${order instanceof Order}`);
    this.logger.log(`Order created at: ${typeof order.createdAt}`);
    return "ok";
  }
}
