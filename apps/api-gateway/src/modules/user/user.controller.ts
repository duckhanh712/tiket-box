import { CreateUserDto, JwtPayload, UpdateUserDto, USER_PATTERNS, USER_SERVICE, UserRole } from '@app/common';
import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(@Inject(USER_SERVICE) private readonly userClient: ClientProxy) {}

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.userClient.send(USER_PATTERNS.FIND_ONE, user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    const { role: _ignored, ...data } = dto; // users cannot change their own role
    return this.userClient.send(USER_PATTERNS.UPDATE, { id: user.sub, dto: data });
  }

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userClient.send(USER_PATTERNS.CREATE, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.userClient.send(USER_PATTERNS.FIND_ALL, {});
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userClient.send(USER_PATTERNS.FIND_ONE, id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.userClient.send(USER_PATTERNS.UPDATE, { id, dto });
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userClient.send(USER_PATTERNS.REMOVE, id);
  }
}
