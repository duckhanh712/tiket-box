import {
  AUTH_SERVICE,
  BOOKING_SERVICE,
  CHECKIN_SERVICE,
  EVENT_SERVICE,
  PAYMENT_SERVICE,
  tcpClient,
  TICKET_SERVICE,
  USER_SERVICE,
} from '@app/common';
import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

/** TCP clients to every downstream microservice, available app-wide. */
@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      tcpClient(USER_SERVICE, 'USER_SERVICE'),
      tcpClient(AUTH_SERVICE, 'AUTH_SERVICE'),
      tcpClient(EVENT_SERVICE, 'EVENT_SERVICE'),
      tcpClient(BOOKING_SERVICE, 'BOOKING_SERVICE'),
      tcpClient(PAYMENT_SERVICE, 'PAYMENT_SERVICE'),
      tcpClient(TICKET_SERVICE, 'TICKET_SERVICE'),
      tcpClient(CHECKIN_SERVICE, 'CHECKIN_SERVICE'),
    ]),
  ],
  exports: [ClientsModule],
})
export class ClientsGatewayModule {}
