import { tcpClient, TICKET_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([tcpClient(TICKET_SERVICE, 'TICKET_SERVICE')]),
  ],
  controllers: [CheckinController],
  providers: [PrismaService, CheckinService],
})
export class CheckinServiceModule {}
