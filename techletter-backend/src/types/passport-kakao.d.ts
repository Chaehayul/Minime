declare module 'passport-kakao' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface StrategyOptions {
    clientID: string;
    clientSecret?: string;
    callbackURL: string;
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: Error | null, user?: unknown) => void,
      ) => void,
    );
  }
}
