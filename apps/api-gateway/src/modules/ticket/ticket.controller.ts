import { JwtPayload, TICKET_PATTERNS, TICKET_SERVICE } from '@app/common';
import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Ticket')
@ApiBearerAuth()
@Controller('tickets')
export class TicketController {
  constructor(@Inject(TICKET_SERVICE) private readonly ticketClient: ClientProxy) {}

  @Get()
  findMine(@CurrentUser() user: JwtPayload) {
    return this.ticketClient.send(TICKET_PATTERNS.FIND_BY_USER, user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.ticketClient.send(TICKET_PATTERNS.FIND_ONE, { id, userId: user.sub });
  }
}
