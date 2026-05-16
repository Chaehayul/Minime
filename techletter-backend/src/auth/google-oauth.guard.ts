import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export interface OAuthErrorUser {
  oauthError: string;
}

@Injectable()
export class GoogleLoginGuard extends AuthGuard('google') {
  getAuthenticateOptions() {
    return { state: 'login' };
  }
}

@Injectable()
export class GoogleSignupGuard extends AuthGuard('google') {
  getAuthenticateOptions() {
    return { state: 'signup' };
  }
}

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown): TUser | OAuthErrorUser {
    if (err) {
      return { oauthError: err instanceof Error ? err.message : 'Google authentication failed' };
    }

    if (!user) {
      return { oauthError: info instanceof Error ? info.message : 'Google authentication failed' };
    }

    return user;
  }
}
