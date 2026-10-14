import { CHECKIN_PATTERNS, CHECKIN_SERVICE, CheckInDto, JwtPayload, UserRole } from '@app/common';
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Checkin')
@ApiBearerAuth()
@Roles(UserRole.STAFF, UserRole.ADMIN)
@Controller('checkins')
export class CheckinController {
  constructor(@Inject(CHECKIN_SERVICE) private readonly checkinClient: ClientProxy) {}

  @Post()
  checkIn(@CurrentUser() user: JwtPayload, @Body() dto: CheckInDto) {
    return this.checkinClient.send(CHECKIN_PATTERNS.CHECK_IN, { ...dto, staffId: user.sub });
  }

  @Get('events/:eventId')
  findByEvent(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.checkinClient.send(CHECKIN_PATTERNS.FIND_BY_EVENT, eventId);
  }
}
