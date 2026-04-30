import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { SocialProvider } from '../users/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') ?? 'missing-google-client-id',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') ?? 'missing-google-client-secret',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ?? 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new UnauthorizedException('Google 계정 이메일을 확인할 수 없습니다.'));
    }

    return done(null, {
      email,
      nickname: profile.displayName || email.split('@')[0],
      socialProvider: SocialProvider.GOOGLE,
      socialId: profile.id,
      profileImage: profile.photos?.[0]?.value,
    });
  }
}
