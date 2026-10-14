import { IsEnum, IsUUID } from 'class-validator';
import { PaymentMethod } from '../enums';

export class CreatePaymentDto {
  @IsUUID()
  bookingId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}

export interface CreatePaymentPayload extends CreatePaymentDto {
  userId: string;
}
