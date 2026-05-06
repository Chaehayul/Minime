import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async findByNews(newsId: number) {
    return this.commentRepository.find({
      where: { newsId },
      order: { isBest: 'DESC', likeCount: 'DESC', createdAt: 'ASC' },
      relations: ['user'],
    });
  }

  async create(content: string, userId: number, newsId: number) {
    const comment = this.commentRepository.create({ content, userId, newsId });
    return this.commentRepository.save(comment);
  }

  async update(id: number, content: string, userId: number) {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.userId !== userId) throw new ForbiddenException('권한이 없습니다.');
    comment.content = content;
    return this.commentRepository.save(comment);
  }

  async remove(id: number, userId: number) {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.userId !== userId) throw new ForbiddenException('권한이 없습니다.');
    return this.commentRepository.remove(comment);
  }

  async likeComment(id: number) {
    await this.commentRepository.increment({ id }, 'likeCount', 1);
    return { success: true };
  }
}