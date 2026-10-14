import { JwtPayload, LoginDto, RegisterDto, USER_PATTERNS, USER_SERVICE } from '@app/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await firstValueFrom(this.userClient.send<UserInfo>(USER_PATTERNS.CREATE, dto));
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await firstValueFrom(
      this.userClient.send<UserInfo>(USER_PATTERNS.VALIDATE_CREDENTIALS, dto),
    );
    return this.buildAuthResponse(user);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async buildAuthResponse(user: UserInfo) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: await this.jwtService.signAsync(payload), user };
  }
}
