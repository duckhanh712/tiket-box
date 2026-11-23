import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [EventController],
  providers: [PrismaService, EventService],
})
export class EventServiceModule {}
