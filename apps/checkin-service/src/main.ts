import { bootstrapMicroservice } from '@app/common';
import { CheckinServiceModule } from './checkin-service.module';

bootstrapMicroservice(CheckinServiceModule, 'CHECKIN_SERVICE');
