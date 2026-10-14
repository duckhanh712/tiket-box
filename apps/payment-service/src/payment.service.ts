import {
  BOOKING_PATTERNS,
  BOOKING_SERVICE,
  BookingStatus,
  CreatePaymentPayload,
  PaymentStatus,
  TICKET_PATTERNS,
  TICKET_SERVICE,
} from '@app/common';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

export interface BookingInfo {
  id: string;
  eventId: string;
  userId: string;
  quantity: number;
  totalAmount: number;
  status: BookingStatus;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @Inject(BOOKING_SERVICE) private readonly bookingClient: ClientProxy,
    @Inject(TICKET_SERVICE) private readonly ticketClient: ClientProxy,
  ) {}

  /**
   * Basic flow (mock gateway): charge -> confirm booking -> issue tickets.
   * TODO: integrate a real payment provider + webhook, and make this a saga.
   */
  async create({ bookingId, userId, method }: CreatePaymentPayload) {
    const booking = await firstValueFrom(
      this.bookingClient.send<BookingInfo>(BOOKING_PATTERNS.FIND_ONE, { id: bookingId, userId }),
    );
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not awaiting payment');
    }

    const payment = await this.payments.save(
      this.payments.create({
        bookingId,
        userId,
        method,
        amount: booking.totalAmount,
        status: PaymentStatus.SUCCESS,
        transactionId: `MOCK-${randomUUID()}`,
      }),
    );

    await firstValueFrom(this.bookingClient.send(BOOKING_PATTERNS.CONFIRM, bookingId));
    const tickets = await firstValueFrom(
      this.ticketClient.send(TICKET_PATTERNS.ISSUE, {
        bookingId,
        eventId: booking.eventId,
        userId,
        quantity: booking.quantity,
      }),
    );
    return { payment, tickets };
  }

  findByUser(userId: string) {
    return this.payments.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, userId: string) {
    const payment = await this.payments.findOne({ where: { id, userId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
