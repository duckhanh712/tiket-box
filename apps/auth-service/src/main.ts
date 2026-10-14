import { bootstrapMicroservice } from '@app/common';
import { AuthServiceModule } from './auth-service.module';

bootstrapMicroservice(AuthServiceModule, 'AUTH_SERVICE');
