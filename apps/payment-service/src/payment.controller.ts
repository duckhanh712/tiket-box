import { CreatePaymentPayload, PAYMENT_PATTERNS } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @MessagePattern(PAYMENT_PATTERNS.CREATE)
  create(@Payload() payload: CreatePaymentPayload) {
    return this.paymentService.create(payload);
  }

  @MessagePattern(PAYMENT_PATTERNS.FIND_BY_USER)
  findByUser(@Payload() userId: string) {
    return this.paymentService.findByUser(userId);
  }

  @MessagePattern(PAYMENT_PATTERNS.FIND_ONE)
  findOne(@Payload() { id, userId }: { id: string; userId: string }) {
    return this.paymentService.findOne(id, userId);
  }
}
