import { CreateUserDto, UpdateUserDto } from '@app/common';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from './prisma.service';

/** The password hash never leaves this service, except for credential checks. */
const omitPassword = { password: true } as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email }, select: { id: true } })) {
      throw new ConflictException('Email already exists');
    }
    return this.prisma.user.create({
      data: { ...dto, password: await bcrypt.hash(dto.password, 10) },
      omit: omitPassword,
    });
  }

  findAll() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' }, omit: omitPassword });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, omit: omitPassword });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const data = { ...dto };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    return this.prisma.user.update({ where: { id }, data, omit: omitPassword });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { id };
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true, fullName: true, role: true },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}
