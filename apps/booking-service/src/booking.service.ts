import { BookingStatus, CreateBookingPayload, EVENT_PATTERNS, EVENT_SERVICE } from '@app/common';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private readonly bookings: Repository<Booking>,
    @Inject(EVENT_SERVICE) private readonly eventClient: ClientProxy,
  ) {}

  async create({ userId, eventId, quantity }: CreateBookingPayload) {
    const event = await firstValueFrom(
      this.eventClient.send<{ price: number }>(EVENT_PATTERNS.RESERVE_TICKETS, { eventId, quantity }),
    );
    return this.bookings.save(
      this.bookings.create({ userId, eventId, quantity, totalAmount: event.price * quantity }),
    );
  }

  findByUser(userId: string) {
    return this.bookings.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, userId?: string) {
    const booking = await this.bookings.findOne({ where: userId ? { id, userId } : { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async cancel(id: string, userId: string) {
    const booking = await this.findOne(id, userId);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be cancelled');
    }
    booking.status = BookingStatus.CANCELLED;
    await this.bookings.save(booking);
    await firstValueFrom(
      this.eventClient.send(EVENT_PATTERNS.RELEASE_TICKETS, {
        eventId: booking.eventId,
        quantity: booking.quantity,
      }),
    );
    return booking;
  }

  async confirm(id: string) {
    const booking = await this.findOne(id);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not pending');
    }
    booking.status = BookingStatus.CONFIRMED;
    return this.bookings.save(booking);
  }
}
