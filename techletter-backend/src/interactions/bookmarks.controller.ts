import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post('news/:newsId/bookmarks')
  @UseGuards(JwtAuthGuard)
  toggle(@Param('newsId') newsId: string, @Request() req: any) {
    return this.bookmarksService.toggle(req.user.id, +newsId);
  }

  @Get('users/me/bookmarks')
  @UseGuards(JwtAuthGuard)
  findMyBookmarks(@Request() req: any) {
    return this.bookmarksService.findByUser(req.user.id);
  }
}