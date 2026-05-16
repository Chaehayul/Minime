import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReporterApplyDto } from './dto/reporter-apply.dto';
import { RejectReporterDto } from './dto/reject-reporter.dto';
import { ReporterStatus } from './reporter-profile.entity';
import { ReportersService } from './reporters.service';

@Controller('reporters')
export class ReportersController {
  constructor(private readonly reportersService: ReportersService) {}

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  apply(@Request() req: any, @Body() dto: ReporterApplyDto) {
    return this.reportersService.applyForCurrentUser(req.user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: any) {
    return this.reportersService.findByUserId(req.user.id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any, @Query('status') status?: ReporterStatus) {
    this.reportersService.assertAdmin(req.user);
    return this.reportersService.findAll(status);
  }

  @Post('admin/:id/approve')
  @UseGuards(JwtAuthGuard)
  approve(@Request() req: any, @Param('id') id: string) {
    this.reportersService.assertAdmin(req.user);
    return this.reportersService.approve(+id);
  }

  @Post('admin/:id/reject')
  @UseGuards(JwtAuthGuard)
  reject(@Request() req: any, @Param('id') id: string, @Body() dto: RejectReporterDto) {
    this.reportersService.assertAdmin(req.user);
    return this.reportersService.reject(+id, dto.reason);
  }
}
