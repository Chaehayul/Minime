import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class KakaoLoginGuard extends AuthGuard('kakao') {
  getAuthenticateOptions() {
    return { state: 'login', prompt: 'login' };
  }
}

@Injectable()
export class KakaoSignupGuard extends AuthGuard('kakao') {
  getAuthenticateOptions() {
    return { state: 'signup', prompt: 'login' };
  }
}

@Injectable()
export class KakaoCallbackGuard extends AuthGuard('kakao') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown): TUser {
    if (err) {
      const message = err instanceof Error ? err.message : 'Kakao authentication failed';
      throw new UnauthorizedException(message);
    }

    if (!user) {
      const message = info instanceof Error ? info.message : 'Kakao authentication failed';
      throw new UnauthorizedException(message);
    }

    return user;
  }
}
