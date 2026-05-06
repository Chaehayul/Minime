import { Controller, Post, Param, UseGuards, Request } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('news/:newsId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  toggle(@Param('newsId') newsId: string, @Request() req: any) {
    return this.likesService.toggle(req.user.id, +newsId);
  }
}