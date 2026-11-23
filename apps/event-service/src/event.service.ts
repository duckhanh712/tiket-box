import { CreateEventDto, EventStatus, ReserveTicketsDto, UpdateEventDto } from '@app/common';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Event } from './generated/prisma/client';
import { PrismaService } from './prisma.service';

/** Prisma returns DECIMAL as Decimal.js; the API exposes plain numbers. */
const toEvent = (event: Event) => ({ ...event, price: event.price.toNumber() });

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    return toEvent(
      await this.prisma.event.create({ data: { ...dto, availableTickets: dto.totalTickets } }),
    );
  }

  async findAll() {
    const events = await this.prisma.event.findMany({ orderBy: { startTime: 'asc' } });
    return events.map(toEvent);
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return toEvent(event);
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    // Only rewrite availableTickets when the capacity changes (undefined = untouched).
    let availableTickets: number | undefined;
    if (dto.totalTickets !== undefined) {
      const sold = event.totalTickets - event.availableTickets;
      if (dto.totalTickets < sold) {
        throw new BadRequestException(`totalTickets cannot be less than sold tickets (${sold})`);
      }
      availableTickets = dto.totalTickets - sold;
    }
    return toEvent(
      await this.prisma.event.update({ where: { id }, data: { ...dto, availableTickets } }),
    );
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { id };
  }

  /** Atomically decrements available tickets; fails if not enough left. */
  async reserveTickets({ eventId, quantity }: ReserveTicketsDto) {
    const event = await this.findOne(eventId);
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not open for booking');
    }
    // Single conditional UPDATE: concurrent bookings can never oversell.
    const { count } = await this.prisma.event.updateMany({
      where: { id: eventId, availableTickets: { gte: quantity } },
      data: { availableTickets: { decrement: quantity } },
    });
    if (!count) throw new BadRequestException('Not enough tickets available');
    return this.findOne(eventId);
  }

  async releaseTickets({ eventId, quantity }: ReserveTicketsDto) {
    await this.prisma.event.updateMany({
      where: { id: eventId },
      data: { availableTickets: { increment: quantity } },
    });
    return this.findOne(eventId);
  }
}
