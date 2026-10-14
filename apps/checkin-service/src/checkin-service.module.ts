import { DatabaseModule, tcpClient, TICKET_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { CheckIn } from './entities/checkin.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forService('CHECKIN_DB'),
    TypeOrmModule.forFeature([CheckIn]),
    ClientsModule.registerAsync([tcpClient(TICKET_SERVICE, 'TICKET_SERVICE')]),
  ],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinServiceModule {}
