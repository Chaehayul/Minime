import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SocialProvider, UserRole } from '../users/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { NotificationsService } from '../notifications/notifications.service';

export interface SocialLoginUser {
  email: string;
  nickname: string;
  socialProvider: SocialProvider;
  socialId: string;
  profileImage?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.usersService.createUser({
      email: dto.email,
      password: dto.password,
      nickname: dto.nickname,
    });
    await this.notificationsService.ensurePreferences(user.id, {
      serviceTermsAgreed: dto.agreements?.serviceTermsAgreed ?? true,
      privacyAgreed: dto.agreements?.privacyAgreed ?? true,
      marketingAgreed: dto.agreements?.marketingAgreed ?? false,
      emailEnabled: dto.agreements?.emailEnabled ?? true,
      smsEnabled: dto.agreements?.smsEnabled ?? false,
      kakaoEnabled: dto.agreements?.kakaoEnabled ?? false,
      recommendationEnabled: dto.agreements?.recommendationEnabled ?? true,
    });

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.toSafeUser(user), ...token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.');
    if (!user.password) throw new UnauthorizedException('소셜 로그인으로 가입한 계정입니다.');

    const isValid = await this.usersService.validatePassword(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.');

    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.toSafeUser(user), ...token };
  }

  async socialLogin(payload: SocialLoginUser, mode: 'login' | 'signup' = 'signup') {
    if (mode === 'login') {
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException('가입된 계정이 없습니다. 먼저 회원가입을 진행해주세요.');
      }

      const token = this.generateToken(user.id, user.email, user.role);
      return { user: this.toSafeUser(user), ...token };
    }

    const user = await this.usersService.findOrCreateSocialUser(payload);
    const token = this.generateToken(user.id, user.email, user.role);
    return { user: this.toSafeUser(user), ...token };
  }

  async demoLogin(role: UserRole) {
    if (this.configService.get<string>('PORTFOLIO_DEMO_ENABLED') !== 'true') {
      throw new ForbiddenException('포트폴리오 데모가 비활성화되어 있습니다.');
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new ForbiddenException('지원하지 않는 데모 역할입니다.');
    }

    const configuredId = Number(this.configService.get<string>(`DEMO_${role.toUpperCase()}_USER_ID`));
    const user = await this.usersService.findDemoUser(role, Number.isFinite(configuredId) ? configuredId : undefined);
    if (!user) throw new NotFoundException(`${role} 데모 계정을 찾을 수 없습니다.`);

    return {
      role,
      nickname: user.nickname,
      ...this.generateToken(user.id, user.email, user.role, true),
    };
  }

  private generateToken(userId: number, email: string, role: string, isDemo = false) {
    const payload = { sub: userId, email, role, isDemo };
    const secret = this.configService.get<string>('JWT_SECRET') || 'local-development-secret';
    return {
      accessToken: this.jwtService.sign(payload, {
        secret,
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '7d',
      }),
    };
  }

  private toSafeUser(user: {
    id: number;
    email: string;
    nickname: string;
    role: string;
    profileImage?: string | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      profileImage: user.profileImage ?? null,
    };
  }
}
