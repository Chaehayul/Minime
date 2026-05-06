import { Controller, Post, Body, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginGuard, GoogleSignupGuard } from './google-oauth.guard';
import { KakaoCallbackGuard, KakaoLoginGuard, KakaoSignupGuard } from './kakao-oauth.guard';
import { NaverCallbackGuard, NaverLoginGuard, NaverSignupGuard } from './naver-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(GoogleSignupGuard)
  google() {}

  @Get('google/signup')
  @UseGuards(GoogleSignupGuard)
  googleSignup() {}

  @Get('google/login')
  @UseGuards(GoogleLoginGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    try {
      const result = await this.authService.socialLogin(req.user, this.getOauthMode(req));
      return this.redirectWithToken(res, result.accessToken);
    } catch (error) {
      return this.redirectWithError(res, error);
    }
  }

  @Get('kakao')
  @UseGuards(KakaoSignupGuard)
  kakao() {}

  @Get('kakao/signup')
  @UseGuards(KakaoSignupGuard)
  kakaoSignup() {}

  @Get('kakao/login')
  @UseGuards(KakaoLoginGuard)
  kakaoLogin() {}

  @Get('kakao/callback')
  @UseGuards(KakaoCallbackGuard)
  async kakaoCallback(@Req() req, @Res() res: Response) {
    try {
      const result = await this.authService.socialLogin(req.user, this.getOauthMode(req));
      return this.redirectWithToken(res, result.accessToken);
    } catch (error) {
      return this.redirectWithError(res, error);
    }
  }

  @Get('naver')
  @UseGuards(NaverSignupGuard)
  naver() {}

  @Get('naver/signup')
  @UseGuards(NaverSignupGuard)
  naverSignup() {}

  @Get('naver/login')
  @UseGuards(NaverLoginGuard)
  naverLogin() {}

  @Get('naver/callback')
  @UseGuards(NaverCallbackGuard)
  async naverCallback(@Req() req, @Res() res: Response) {
    try {
      const result = await this.authService.socialLogin(req.user, this.getOauthMode(req));
      return this.redirectWithToken(res, result.accessToken);
    } catch (error) {
      return this.redirectWithError(res, error);
    }
  }

  private redirectWithToken(res: Response, accessToken: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    return res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(accessToken)}`);
  }

  private redirectWithError(res: Response, error: unknown) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    const message =
      error instanceof Error
        ? error.message
        : '소셜 로그인에 실패했습니다. 회원가입을 먼저 진행해주세요.';

    return res.redirect(`${frontendUrl}/signup?error=${encodeURIComponent(message)}`);
  }

  private getOauthMode(req: { query?: { state?: string } }): 'login' | 'signup' {
    return req.query?.state === 'login' ? 'login' : 'signup';
  }
}
