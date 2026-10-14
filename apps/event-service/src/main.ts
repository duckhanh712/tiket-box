import { bootstrapMicroservice } from '@app/common';
import { EventServiceModule } from './event-service.module';

bootstrapMicroservice(EventServiceModule, 'EVENT_SERVICE');
