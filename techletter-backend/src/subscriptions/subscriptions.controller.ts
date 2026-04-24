import { Controller, Get, Post, Delete, Put, Body, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  subscribe(@Request() req: any) {
    return this.subscriptionsService.subscribe(req.user.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  unsubscribe(@Request() req: any) {
    return this.subscriptionsService.unsubscribe(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMySubscription(@Request() req: any) {
    return this.subscriptionsService.getMySubscription(req.user.id);
  }

  @Put('me/settings')
  @UseGuards(JwtAuthGuard)
  updateSettings(
    @Request() req: any,
    @Body() body: { dailyActive?: boolean; weeklyActive?: boolean; dailySendTime?: string },
  ) {
    return this.subscriptionsService.updateSettings(req.user.id, body);
  }
}