import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [TicketController],
  providers: [PrismaService, TicketService],
})
export class TicketServiceModule {}
