import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { News } from '../news/news.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async toggle(userId: number, newsId: number) {
    const existing = await this.bookmarkRepository.findOne({
      where: { userId, newsId },
    });
    if (existing) {
      await this.bookmarkRepository.remove(existing);
      return { bookmarked: false };
    }
    const bookmark = this.bookmarkRepository.create({ userId, newsId });
    await this.bookmarkRepository.save(bookmark);
    return { bookmarked: true };
  }

  async findByUser(userId: number) {
    const bookmarks = await this.bookmarkRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // news 직접 조회해서 붙여줌
    const result = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const news = await this.newsRepository.findOne({
          where: { id: bookmark.newsId },
        });
        return { ...bookmark, news };
      })
    );

    return result;
  }
}