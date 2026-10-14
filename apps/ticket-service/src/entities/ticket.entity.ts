import { TicketStatus } from '@app/common';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Code encoded in the QR shown at the gate. */
  @Column({ unique: true })
  code: string;

  @Index()
  @Column('uuid')
  bookingId: string;

  @Index()
  @Column('uuid')
  eventId: string;

  @Index()
  @Column('uuid')
  userId: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.ACTIVE })
  status: TicketStatus;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
