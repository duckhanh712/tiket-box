import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('check_ins')
export class CheckIn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  ticketId: string;

  @Column()
  ticketCode: string;

  @Index()
  @Column('uuid')
  eventId: string;

  @Column('uuid')
  userId: string;

  /** Staff account that scanned the ticket. */
  @Column('uuid')
  checkedInBy: string;

  @CreateDateColumn({ type: 'timestamptz' })
  checkedInAt: Date;
}
