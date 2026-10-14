import { Logger, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ClientsProviderAsyncOptions, MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RpcAllExceptionsFilter } from './filters';

/**
 * Registers a TCP client to another microservice.
 * `envPrefix` = 'USER_SERVICE' -> reads USER_SERVICE_HOST / USER_SERVICE_PORT.
 */
export const tcpClient = (name: string, envPrefix: string): ClientsProviderAsyncOptions => ({
  name,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    transport: Transport.TCP,
    options: {
      host: config.get<string>(`${envPrefix}_HOST`, 'localhost'),
      port: Number(config.getOrThrow(`${envPrefix}_PORT`)),
    },
  }),
});

/**
 * Shared bootstrap for every TCP microservice.
 */
export async function bootstrapMicroservice(module: Type<unknown>, envPrefix: string): Promise<void> {
  const port = Number(process.env[`${envPrefix}_PORT`]);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(module, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port },
  });
  app.useGlobalFilters(new RpcAllExceptionsFilter());
  await app.listen();
  new Logger(envPrefix).log(`Listening on TCP port ${port}`);
}
