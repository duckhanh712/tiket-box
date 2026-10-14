import { CreateEventDto, EVENT_PATTERNS, EVENT_SERVICE, UpdateEventDto, UserRole } from '@app/common';
import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Event')
@ApiBearerAuth()
@Controller('events')
export class EventController {
  constructor(@Inject(EVENT_SERVICE) private readonly eventClient: ClientProxy) {}

  @Public()
  @Get()
  findAll() {
    return this.eventClient.send(EVENT_PATTERNS.FIND_ALL, {});
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventClient.send(EVENT_PATTERNS.FIND_ONE, id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventClient.send(EVENT_PATTERNS.CREATE, dto);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEventDto) {
    return this.eventClient.send(EVENT_PATTERNS.UPDATE, { id, dto });
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventClient.send(EVENT_PATTERNS.REMOVE, id);
  }
}
