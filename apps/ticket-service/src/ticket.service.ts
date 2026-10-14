import { IssueTicketsPayload, TicketStatus } from '@app/common';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketService {
  constructor(@InjectRepository(Ticket) private readonly tickets: Repository<Ticket>) {}

  async issue({ bookingId, eventId, userId, quantity }: IssueTicketsPayload) {
    const existing = await this.tickets.find({ where: { bookingId } });
    if (existing.length) return existing; // idempotent

    const tickets = Array.from({ length: quantity }, () =>
      this.tickets.create({ bookingId, eventId, userId, code: this.generateCode() }),
    );
    return this.tickets.save(tickets);
  }

  findByUser(userId: string) {
    return this.tickets.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, userId: string) {
    const ticket = await this.tickets.findOne({ where: { id, userId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  /** Marks a ticket as used; only succeeds once per ticket. */
  async use(code: string) {
    const result = await this.tickets.update(
      { code, status: TicketStatus.ACTIVE },
      { status: TicketStatus.USED, usedAt: new Date() },
    );
    if (!result.affected) {
      const ticket = await this.tickets.findOne({ where: { code } });
      if (!ticket) throw new NotFoundException('Ticket not found');
      throw new BadRequestException(`Ticket is ${ticket.status.toLowerCase()}`);
    }
    return this.tickets.findOneOrFail({ where: { code } });
  }

  private generateCode() {
    return `TKB-${randomBytes(6).toString('hex').toUpperCase()}`;
  }
}
