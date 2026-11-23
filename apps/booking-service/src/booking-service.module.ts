import { EVENT_SERVICE, tcpClient } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([tcpClient(EVENT_SERVICE, 'EVENT_SERVICE')]),
  ],
  controllers: [BookingController],
  providers: [PrismaService, BookingService],
})
export class BookingServiceModule {}
