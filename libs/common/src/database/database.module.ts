import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Each microservice connects to its own database, selected by an env key
 * (e.g. `USER_DB`, `EVENT_DB`).
 */
export class DatabaseModule {
  static forService(dbNameEnvKey: string): DynamicModule {
    return TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>(dbNameEnvKey),
        autoLoadEntities: true,
        synchronize: config.get('DB_SYNC') === 'true',
      }),
    });
  }
}
