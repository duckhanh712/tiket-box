import { bootstrapMicroservice } from '@app/common';
import { PaymentServiceModule } from './payment-service.module';

bootstrapMicroservice(PaymentServiceModule, 'PAYMENT_SERVICE');
