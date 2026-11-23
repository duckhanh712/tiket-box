import { IssueTicketsPayload, TicketStatus } from '@app/common';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from './prisma.service';

@Injectable()
export class TicketService {
  constructor(private readonly prisma: PrismaService) {}

  async issue({ bookingId, eventId, userId, quantity }: IssueTicketsPayload) {
    const existing = await this.prisma.ticket.findMany({ where: { bookingId } });
    if (existing.length) return existing; // idempotent

    return this.prisma.ticket.createManyAndReturn({
      data: Array.from({ length: quantity }, () => ({
        bookingId,
        eventId,
        userId,
        code: this.generateCode(),
      })),
    });
  }

  findByUser(userId: string) {
    return this.prisma.ticket.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string, userId: string) {
    const ticket = await this.prisma.ticket.findFirst({ where: { id, userId } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  /** Marks a ticket as used; only succeeds once per ticket. */
  async use(code: string) {
    const { count } = await this.prisma.ticket.updateMany({
      where: { code, status: TicketStatus.ACTIVE },
      data: { status: TicketStatus.USED, usedAt: new Date() },
    });
    if (!count) {
      const ticket = await this.prisma.ticket.findUnique({ where: { code } });
      if (!ticket) throw new NotFoundException('Ticket not found');
      throw new BadRequestException(`Ticket is ${ticket.status.toLowerCase()}`);
    }
    return this.prisma.ticket.findUniqueOrThrow({ where: { code } });
  }

  private generateCode() {
    return `TKB-${randomBytes(6).toString('hex').toUpperCase()}`;
  }
}
