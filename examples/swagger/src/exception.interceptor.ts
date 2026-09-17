import { NotMatchError } from "@beiifeng/nestjs-validator";
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { catchError, Observable, of } from "rxjs";

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  private readonly _logger = new Logger(ExceptionInterceptor.name);

  public intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const clazz = context.getClass();
    const handler = context.getHandler();
    const name = `${clazz.name}.${handler.name}`;

    return next.handle().pipe(
      catchError((error: string | NotMatchError | Error, _caught) => {
        if (typeof error === "string") {
          // For `throw 'Error reason';` case.
          return of(error);
        }
        if (error instanceof NotMatchError) {
          throw new BadRequestException(error);
        }
        if (error instanceof HttpException) {
          throw error;
        }
        if (error instanceof Error) {
          // For `throw new Error();` case, we don't recommend this way.
          this._logger.error(`[${name}] Unhandled Error, don't use generic error.`, error);
        }
        this._logger.error(`[${name}] Unexpected Error`, error);
        throw new InternalServerErrorException(error);
      }),
    );
  }
}
