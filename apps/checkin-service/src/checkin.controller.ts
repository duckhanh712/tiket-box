import { CHECKIN_PATTERNS, CheckInPayload } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CheckinService } from './checkin.service';

@Controller()
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @MessagePattern(CHECKIN_PATTERNS.CHECK_IN)
  checkIn(@Payload() payload: CheckInPayload) {
    return this.checkinService.checkIn(payload);
  }

  @MessagePattern(CHECKIN_PATTERNS.FIND_BY_EVENT)
  findByEvent(@Payload() eventId: string) {
    return this.checkinService.findByEvent(eventId);
  }
}
