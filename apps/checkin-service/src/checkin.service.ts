import { CheckInPayload, TICKET_PATTERNS, TICKET_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CheckIn } from './entities/checkin.entity';

export interface TicketInfo {
  id: string;
  code: string;
  eventId: string;
  userId: string;
}

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(CheckIn) private readonly checkIns: Repository<CheckIn>,
    @Inject(TICKET_SERVICE) private readonly ticketClient: ClientProxy,
  ) {}

  async checkIn({ ticketCode, staffId }: CheckInPayload) {
    // ticket-service guarantees a ticket can only be used once
    const ticket = await firstValueFrom(
      this.ticketClient.send<TicketInfo>(TICKET_PATTERNS.USE, ticketCode),
    );
    return this.checkIns.save(
      this.checkIns.create({
        ticketId: ticket.id,
        ticketCode: ticket.code,
        eventId: ticket.eventId,
        userId: ticket.userId,
        checkedInBy: staffId,
      }),
    );
  }

  findByEvent(eventId: string) {
    return this.checkIns.find({ where: { eventId }, order: { checkedInAt: 'DESC' } });
  }
}
