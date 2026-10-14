import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

/**
 * Maps errors from microservices (`{ statusCode, message }`) and
 * transport failures back to proper HTTP responses.
 */
@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GatewayExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      return res.status(exception.getStatus()).json(exception.getResponse());
    }

    if (typeof exception === 'object' && exception !== null && 'statusCode' in exception) {
      const { statusCode, message } = exception as { statusCode: number; message: unknown };
      return res.status(statusCode).json({ statusCode, message });
    }

    // e.g. ECONNREFUSED when a microservice is down
    const code = (exception as { code?: string })?.code;
    if (code === 'ECONNREFUSED') {
      return res
        .status(HttpStatus.SERVICE_UNAVAILABLE)
        .json({ statusCode: HttpStatus.SERVICE_UNAVAILABLE, message: 'Service unavailable' });
    }

    this.logger.error(exception);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' });
  }
}
