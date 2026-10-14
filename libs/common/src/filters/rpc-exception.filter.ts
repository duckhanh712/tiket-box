import { ArgumentsHost, Catch, HttpException, Logger, RpcExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

export interface RpcError {
  statusCode: number;
  message: string | string[];
}

/**
 * Used inside microservices: normalizes every thrown error into
 * `{ statusCode, message }` so the gateway can map it back to HTTP.
 */
@Catch()
export class RpcAllExceptionsFilter implements RpcExceptionFilter<unknown> {
  private readonly logger = new Logger(RpcAllExceptionsFilter.name);

  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    return throwError(() => this.normalize(exception));
  }

  private normalize(exception: unknown): RpcError {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'object' && res !== null && 'message' in res
          ? (res as { message: string | string[] }).message
          : exception.message;
      return { statusCode: exception.getStatus(), message };
    }
    if (exception instanceof RpcException) {
      const err = exception.getError();
      return typeof err === 'object' ? (err as RpcError) : { statusCode: 500, message: err };
    }
    // Error propagated from another microservice call
    if (typeof exception === 'object' && exception !== null && 'statusCode' in exception) {
      return exception as RpcError;
    }
    this.logger.error(exception);
    return { statusCode: 500, message: (exception as Error)?.message ?? 'Internal server error' };
  }
}
