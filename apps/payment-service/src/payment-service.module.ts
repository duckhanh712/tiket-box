import { BOOKING_SERVICE, DatabaseModule, tcpClient, TICKET_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forService('PAYMENT_DB'),
    TypeOrmModule.forFeature([Payment]),
    ClientsModule.registerAsync([
      tcpClient(BOOKING_SERVICE, 'BOOKING_SERVICE'),
      tcpClient(TICKET_SERVICE, 'TICKET_SERVICE'),
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentServiceModule {}
