import { CreateUserDto, UpdateUserDto } from '@app/common';
import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async create(dto: CreateUserDto) {
    if (await this.users.exists({ where: { email: dto.email } })) {
      throw new ConflictException('Email already exists');
    }
    const user = await this.users.save(
      this.users.create({ ...dto, password: await bcrypt.hash(dto.password, 10) }),
    );
    return this.findOne(user.id);
  }

  findAll() {
    return this.users.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const data = { ...dto };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    await this.users.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.users.remove(user);
    return { id };
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.users.findOne({
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
