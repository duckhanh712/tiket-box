import { CreatePaymentDto, JwtPayload, PAYMENT_PATTERNS, PAYMENT_SERVICE } from '@app/common';
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Payment')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(@Inject(PAYMENT_SERVICE) private readonly paymentClient: ClientProxy) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePaymentDto) {
    return this.paymentClient.send(PAYMENT_PATTERNS.CREATE, { ...dto, userId: user.sub });
  }

  @Get()
  findMine(@CurrentUser() user: JwtPayload) {
    return this.paymentClient.send(PAYMENT_PATTERNS.FIND_BY_USER, user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.paymentClient.send(PAYMENT_PATTERNS.FIND_ONE, { id, userId: user.sub });
  }
}
