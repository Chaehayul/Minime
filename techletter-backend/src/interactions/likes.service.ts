import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
  ) {}

  async toggle(userId: number, newsId: number) {
    const existing = await this.likeRepository.findOne({
      where: { userId, newsId },
    });
    if (existing) {
      await this.likeRepository.remove(existing);
      return { liked: false };
    }
    const like = this.likeRepository.create({ userId, newsId });
    await this.likeRepository.save(like);
    return { liked: true };
  }

  async count(newsId: number) {
    return this.likeRepository.count({ where: { newsId } });
  }
}