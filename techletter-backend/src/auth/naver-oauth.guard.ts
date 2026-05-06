import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class NaverLoginGuard extends AuthGuard('naver') {
  getAuthenticateOptions() {
    return { state: 'login' };
  }
}

@Injectable()
export class NaverSignupGuard extends AuthGuard('naver') {
  getAuthenticateOptions() {
    return { state: 'signup' };
  }
}

@Injectable()
export class NaverCallbackGuard extends AuthGuard('naver') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown): TUser {
    if (err) {
      const message = err instanceof Error ? err.message : 'Naver authentication failed';
      throw new UnauthorizedException(message);
    }

    if (!user) {
      const message = info instanceof Error ? info.message : 'Naver authentication failed';
      throw new UnauthorizedException(message);
    }

    return user;
  }
}
