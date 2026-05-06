import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { News } from '../news/news.entity';

@Module({
  imports: [TypeOrmModule.forFeature([News])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}