import { bootstrapMicroservice } from '@app/common';
import { UserServiceModule } from './user-service.module';

bootstrapMicroservice(UserServiceModule, 'USER_SERVICE');
