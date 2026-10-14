import { BOOKING_PATTERNS, BOOKING_SERVICE, CreateBookingDto, JwtPayload } from '@app/common';
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Booking')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(@Inject(BOOKING_SERVICE) private readonly bookingClient: ClientProxy) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBookingDto) {
    return this.bookingClient.send(BOOKING_PATTERNS.CREATE, { ...dto, userId: user.sub });
  }

  @Get()
  findMine(@CurrentUser() user: JwtPayload) {
    return this.bookingClient.send(BOOKING_PATTERNS.FIND_BY_USER, user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.bookingClient.send(BOOKING_PATTERNS.FIND_ONE, { id, userId: user.sub });
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.bookingClient.send(BOOKING_PATTERNS.CANCEL, { id, userId: user.sub });
  }
}
