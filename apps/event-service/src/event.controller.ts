import { CreateEventDto, EVENT_PATTERNS, ReserveTicketsDto, UpdateEventDto } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EventService } from './event.service';

@Controller()
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @MessagePattern(EVENT_PATTERNS.CREATE)
  create(@Payload() dto: CreateEventDto) {
    return this.eventService.create(dto);
  }

  @MessagePattern(EVENT_PATTERNS.FIND_ALL)
  findAll() {
    return this.eventService.findAll();
  }

  @MessagePattern(EVENT_PATTERNS.FIND_ONE)
  findOne(@Payload() id: string) {
    return this.eventService.findOne(id);
  }

  @MessagePattern(EVENT_PATTERNS.UPDATE)
  update(@Payload() { id, dto }: { id: string; dto: UpdateEventDto }) {
    return this.eventService.update(id, dto);
  }

  @MessagePattern(EVENT_PATTERNS.REMOVE)
  remove(@Payload() id: string) {
    return this.eventService.remove(id);
  }

  @MessagePattern(EVENT_PATTERNS.RESERVE_TICKETS)
  reserveTickets(@Payload() dto: ReserveTicketsDto) {
    return this.eventService.reserveTickets(dto);
  }

  @MessagePattern(EVENT_PATTERNS.RELEASE_TICKETS)
  releaseTickets(@Payload() dto: ReserveTicketsDto) {
    return this.eventService.releaseTickets(dto);
  }
}
