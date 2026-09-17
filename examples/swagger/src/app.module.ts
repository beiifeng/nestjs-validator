import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { AppController } from "./app.controller";
import { ExceptionInterceptor } from "./exception.interceptor";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: ExceptionInterceptor }],
})
export class AppModule {}
