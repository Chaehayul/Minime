import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthErrorUser } from './google-oauth.guard';

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
  handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown): TUser | OAuthErrorUser {
    if (err) {
      return { oauthError: err instanceof Error ? err.message : 'Kakao authentication failed' };
    }

    if (!user) {
      return { oauthError: info instanceof Error ? info.message : 'Kakao authentication failed' };
    }

    return user;
  }
}
