import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.usersService.createUser({
      email: dto.email,
      password: dto.password,
      nickname: dto.nickname,
    });

    const token = this.generateToken(user.id, user.email, user.role);
    return { user, ...token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.');

    const isValid = await this.usersService.validatePassword(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.');

    const token = this.generateToken(user.id, user.email, user.role);
    return { user, ...token };
  }

  private generateToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}