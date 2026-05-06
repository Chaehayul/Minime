import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { InteractionsModule } from './interactions/interactions.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { StatsModule } from './stats/stats.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: +(config.get<string>('DB_PORT') ?? '3306'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
      }),
    }),
    UsersModule,
    AuthModule,
    NewsModule,
    CategoriesModule,
    TagsModule,
    InteractionsModule,
    SubscriptionsModule,
    StatsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
