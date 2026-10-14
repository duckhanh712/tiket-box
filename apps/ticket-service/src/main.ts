import { bootstrapMicroservice } from '@app/common';
import { TicketServiceModule } from './ticket-service.module';

bootstrapMicroservice(TicketServiceModule, 'TICKET_SERVICE');
