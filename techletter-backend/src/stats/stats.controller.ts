import {
  Controller,
  ForbiddenException,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../users/user.entity';

interface AuthenticatedRequest {
  user: {
    role: UserRole;
  };
}

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard(@Request() request: AuthenticatedRequest) {
    if (request.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        '관리자만 대시보드 통계를 조회할 수 있습니다.',
      );
    }
    return this.statsService.getDashboard();
  }

  @Get('top-news')
  getTopNews() {
    return this.statsService.getTopNews();
  }
}
