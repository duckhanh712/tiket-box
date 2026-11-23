import { BookingStatus, CreateBookingPayload, EVENT_PATTERNS, EVENT_SERVICE } from '@app/common';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { Booking } from './generated/prisma/client';
import { PrismaService } from './prisma.service';

/** Prisma returns DECIMAL as Decimal.js; the API exposes plain numbers. */
const toBooking = (booking: Booking) => ({ ...booking, totalAmount: booking.totalAmount.toNumber() });

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EVENT_SERVICE) private readonly eventClient: ClientProxy,
  ) {}

  async create({ userId, eventId, quantity }: CreateBookingPayload) {
    const event = await firstValueFrom(
      this.eventClient.send<{ price: number }>(EVENT_PATTERNS.RESERVE_TICKETS, { eventId, quantity }),
    );
    return toBooking(
      await this.prisma.booking.create({
        data: { userId, eventId, quantity, totalAmount: event.price * quantity },
      }),
    );
  }

  async findByUser(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map(toBooking);
  }

  async findOne(id: string, userId?: string) {
    const booking = await this.prisma.booking.findFirst({ where: userId ? { id, userId } : { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return toBooking(booking);
  }

  async cancel(id: string, userId: string) {
    const booking = await this.findOne(id, userId);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be cancelled');
    }
    const cancelled = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });
    await firstValueFrom(
      this.eventClient.send(EVENT_PATTERNS.RELEASE_TICKETS, {
        eventId: booking.eventId,
        quantity: booking.quantity,
      }),
    );
    return toBooking(cancelled);
  }

  async confirm(id: string) {
    const booking = await this.findOne(id);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not pending');
    }
    return toBooking(
      await this.prisma.booking.update({ where: { id }, data: { status: BookingStatus.CONFIRMED } }),
    );
  }
}
