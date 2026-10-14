import { DatabaseModule, EVENT_SERVICE, tcpClient } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forService('BOOKING_DB'),
    TypeOrmModule.forFeature([Booking]),
    ClientsModule.registerAsync([tcpClient(EVENT_SERVICE, 'EVENT_SERVICE')]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingServiceModule {}
