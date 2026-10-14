import { bootstrapMicroservice } from '@app/common';
import { BookingServiceModule } from './booking-service.module';

bootstrapMicroservice(BookingServiceModule, 'BOOKING_SERVICE');
