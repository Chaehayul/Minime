import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './news.entity';
import { Tag } from '../tags/tag.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsScheduler } from './news.scheduler';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([News, Tag]), AuthModule],
  providers: [NewsService, NewsScheduler],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}