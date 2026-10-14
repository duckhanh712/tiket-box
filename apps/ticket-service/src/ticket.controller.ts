import { IssueTicketsPayload, TICKET_PATTERNS } from '@app/common';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TicketService } from './ticket.service';

@Controller()
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @MessagePattern(TICKET_PATTERNS.ISSUE)
  issue(@Payload() payload: IssueTicketsPayload) {
    return this.ticketService.issue(payload);
  }

  @MessagePattern(TICKET_PATTERNS.FIND_BY_USER)
  findByUser(@Payload() userId: string) {
    return this.ticketService.findByUser(userId);
  }

  @MessagePattern(TICKET_PATTERNS.FIND_ONE)
  findOne(@Payload() { id, userId }: { id: string; userId: string }) {
    return this.ticketService.findOne(id, userId);
  }

  @MessagePattern(TICKET_PATTERNS.USE)
  use(@Payload() code: string) {
    return this.ticketService.use(code);
  }
}
