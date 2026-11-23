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
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import type { Payment } from './generated/prisma/client';
import { PrismaService } from './prisma.service';

export interface BookingInfo {
  id: string;
  eventId: string;
  userId: string;
  quantity: number;
  totalAmount: number;
  status: BookingStatus;
}

/** Prisma returns DECIMAL as Decimal.js; the API exposes plain numbers. */
const toPayment = (payment: Payment) => ({ ...payment, amount: payment.amount.toNumber() });

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
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

    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        userId,
        method,
        amount: booking.totalAmount,
        status: PaymentStatus.SUCCESS,
        transactionId: `MOCK-${randomUUID()}`,
      },
    });

    await firstValueFrom(this.bookingClient.send(BOOKING_PATTERNS.CONFIRM, bookingId));
    const tickets = await firstValueFrom(
      this.ticketClient.send(TICKET_PATTERNS.ISSUE, {
        bookingId,
        eventId: booking.eventId,
        userId,
        quantity: booking.quantity,
      }),
    );
    return { payment: toPayment(payment), tickets };
  }

  async findByUser(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return payments.map(toPayment);
  }

  async findOne(id: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id, userId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return toPayment(payment);
  }
}
