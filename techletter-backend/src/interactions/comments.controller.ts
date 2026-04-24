import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('news/:newsId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('newsId') newsId: string) {
    return this.commentsService.findByNews(+newsId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('newsId') newsId: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    return this.commentsService.create(body.content, req.user.id, +newsId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    return this.commentsService.update(+id, body.content, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.remove(+id, req.user.id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  likeComment(@Param('id') id: string) {
    return this.commentsService.likeComment(+id);
  }
}