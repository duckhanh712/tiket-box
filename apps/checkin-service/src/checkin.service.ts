import { CheckInPayload, TICKET_PATTERNS, TICKET_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from './prisma.service';

export interface TicketInfo {
  id: string;
  code: string;
  eventId: string;
  userId: string;
}

@Injectable()
export class CheckinService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(TICKET_SERVICE) private readonly ticketClient: ClientProxy,
  ) {}

  async checkIn({ ticketCode, staffId }: CheckInPayload) {
    // ticket-service guarantees a ticket can only be used once
    const ticket = await firstValueFrom(
      this.ticketClient.send<TicketInfo>(TICKET_PATTERNS.USE, ticketCode),
    );
    return this.prisma.checkIn.create({
      data: {
        ticketId: ticket.id,
        ticketCode: ticket.code,
        eventId: ticket.eventId,
        userId: ticket.userId,
        checkedInBy: staffId,
      },
    });
  }

  findByEvent(eventId: string) {
    return this.prisma.checkIn.findMany({ where: { eventId }, orderBy: { checkedInAt: 'desc' } });
  }
}
