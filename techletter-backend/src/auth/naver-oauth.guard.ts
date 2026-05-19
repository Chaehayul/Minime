import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthErrorUser } from './google-oauth.guard';

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
  handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown): TUser | OAuthErrorUser {
    if (err) {
      return { oauthError: err instanceof Error ? err.message : 'Naver authentication failed' };
    }

    if (!user) {
      return { oauthError: info instanceof Error ? info.message : 'Naver authentication failed' };
    }

    return user;
  }
}
