import { CreateEventDto, EventStatus, ReserveTicketsDto, UpdateEventDto } from '@app/common';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventService {
  constructor(@InjectRepository(Event) private readonly events: Repository<Event>) {}

  create(dto: CreateEventDto) {
    return this.events.save(this.events.create({ ...dto, availableTickets: dto.totalTickets }));
  }

  findAll() {
    return this.events.find({ order: { startTime: 'ASC' } });
  }

  async findOne(id: string) {
    const event = await this.events.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    if (dto.totalTickets !== undefined) {
      const sold = event.totalTickets - event.availableTickets;
      if (dto.totalTickets < sold) {
        throw new BadRequestException(`totalTickets cannot be less than sold tickets (${sold})`);
      }
      event.availableTickets = dto.totalTickets - sold;
    }
    return this.events.save(Object.assign(event, dto));
  }

  async remove(id: string) {
    await this.events.remove(await this.findOne(id));
    return { id };
  }

  /** Atomically decrements available tickets; fails if not enough left. */
  async reserveTickets({ eventId, quantity }: ReserveTicketsDto) {
    const event = await this.findOne(eventId);
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not open for booking');
    }
    const result = await this.events
      .createQueryBuilder()
      .update(Event)
      .set({ availableTickets: () => '"availableTickets" - :quantity' })
      .where('id = :eventId AND "availableTickets" >= :quantity', { eventId, quantity })
      .execute();
    if (!result.affected) throw new BadRequestException('Not enough tickets available');
    return this.findOne(eventId);
  }

  async releaseTickets({ eventId, quantity }: ReserveTicketsDto) {
    await this.events.increment({ id: eventId }, 'availableTickets', quantity);
    return this.findOne(eventId);
  }
}
