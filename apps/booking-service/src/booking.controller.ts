import { BOOKING_PATTERNS, CreateBookingPayload } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingService } from './booking.service';

@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @MessagePattern(BOOKING_PATTERNS.CREATE)
  create(@Payload() payload: CreateBookingPayload) {
    return this.bookingService.create(payload);
  }

  @MessagePattern(BOOKING_PATTERNS.FIND_BY_USER)
  findByUser(@Payload() userId: string) {
    return this.bookingService.findByUser(userId);
  }

  @MessagePattern(BOOKING_PATTERNS.FIND_ONE)
  findOne(@Payload() { id, userId }: { id: string; userId?: string }) {
    return this.bookingService.findOne(id, userId);
  }

  @MessagePattern(BOOKING_PATTERNS.CANCEL)
  cancel(@Payload() { id, userId }: { id: string; userId: string }) {
    return this.bookingService.cancel(id, userId);
  }

  @MessagePattern(BOOKING_PATTERNS.CONFIRM)
  confirm(@Payload() id: string) {
    return this.bookingService.confirm(id);
  }
}
