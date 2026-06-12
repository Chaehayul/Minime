import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeletedUser } from './deleted-user.entity';
import { Bookmark } from '../interactions/entities/bookmark.entity';
import { Like } from '../interactions/entities/like.entity';
import { News } from '../news/news.entity';
import { NewsView } from '../news/news-view.entity';
import { Comment } from '../interactions/entities/comment.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      DeletedUser,
      Bookmark,
      Like,
      News,
      NewsView,
      Comment,
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
