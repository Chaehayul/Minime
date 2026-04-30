import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { SocialProvider } from '../users/user.entity';

interface KakaoProfile {
  id: string | number;
  username?: string;
  displayName?: string;
  _json?: {
    properties?: {
      nickname?: string;
      profile_image?: string;
    };
    kakao_account?: {
      email?: string;
      profile?: {
        nickname?: string;
        profile_image_url?: string;
      };
    };
  };
}

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('KAKAO_CLIENT_ID') ?? 'missing-kakao-client-id',
      clientSecret: config.get<string>('KAKAO_CLIENT_SECRET') ?? '',
      callbackURL:
        config.get<string>('KAKAO_CALLBACK_URL') ?? 'http://localhost:3000/auth/kakao/callback',
    });
  }

  authorizationParams(options: { prompt?: string }) {
    return options.prompt ? { prompt: options.prompt } : {};
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: KakaoProfile,
    done: (error: Error | null, user?: unknown) => void,
  ) {
    const socialId = String(profile.id);
    const email = profile._json?.kakao_account?.email;
    if (!email) {
      return done(new UnauthorizedException('카카오 계정 이메일 제공에 동의해야 합니다.'));
    }

    const nickname =
      profile._json?.kakao_account?.profile?.nickname ??
      profile._json?.properties?.nickname ??
      profile.displayName ??
      profile.username ??
      email.split('@')[0];

    return done(null, {
      email,
      nickname,
      socialProvider: SocialProvider.KAKAO,
      socialId,
      profileImage:
        profile._json?.kakao_account?.profile?.profile_image_url ??
        profile._json?.properties?.profile_image,
    });
  }
}
