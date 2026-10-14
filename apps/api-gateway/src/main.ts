import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiGatewayModule } from './api-gateway.module';
import { GatewayExceptionFilter } from './common/filters/gateway-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new GatewayExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tiketbox API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig), {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = Number(process.env.GATEWAY_PORT ?? 3000);
  await app.listen(port);
  new Logger('API_GATEWAY').log(`HTTP server running on http://localhost:${port}/api`);
  new Logger('API_GATEWAY').log(`Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
