import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard() {
    return this.statsService.getDashboard();
  }

  @Get('top-news')
  getTopNews() {
    return this.statsService.getTopNews();
  }
}