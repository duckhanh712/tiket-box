import { BOOKING_SERVICE, tcpClient, TICKET_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      tcpClient(BOOKING_SERVICE, 'BOOKING_SERVICE'),
      tcpClient(TICKET_SERVICE, 'TICKET_SERVICE'),
    ]),
  ],
  controllers: [PaymentController],
  providers: [PrismaService, PaymentService],
})
export class PaymentServiceModule {}
