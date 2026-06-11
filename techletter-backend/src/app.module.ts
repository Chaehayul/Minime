import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NewsModule } from './news/news.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { InteractionsModule } from './interactions/interactions.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { StatsModule } from './stats/stats.module';
import { UploadModule } from './upload/upload.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ReportersModule } from './reporters/reporters.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DemoReadOnlyInterceptor } from './auth/demo-read-only.interceptor';
import type { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

function createDatabaseOptions(config: ConfigService): MysqlConnectionOptions | PostgresConnectionOptions {
  const common = {
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
    logging: false,
  };
  const databaseUrl = config.get<string>('DATABASE_URL');
  const databaseType = config.get<string>('DB_TYPE') ?? (databaseUrl ? 'postgres' : 'mysql');

  if (databaseType === 'postgres') {
    return {
      ...common,
      type: 'postgres',
      url: databaseUrl,
      host: databaseUrl ? undefined : config.get<string>('DB_HOST'),
      port: databaseUrl ? undefined : parseInt(config.get<string>('DB_PORT') || '5432', 10),
      username: databaseUrl ? undefined : config.get<string>('DB_USERNAME'),
      password: databaseUrl ? undefined : config.get<string>('DB_PASSWORD'),
      database: databaseUrl ? undefined : config.get<string>('DB_DATABASE'),
      ssl: config.get<string>('DB_SSL') === 'false' ? false : { rejectUnauthorized: false },
    };
  }

  return {
    ...common,
    type: 'mysql',
    host: config.get<string>('DB_HOST'),
    port: parseInt(config.get<string>('DB_PORT') || '3306', 10),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_DATABASE'),
    ssl: config.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : undefined,
  };
}

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
      useFactory: createDatabaseOptions,
    }),
    UsersModule,
    AuthModule,
    NewsModule,
    CategoriesModule,
    TagsModule,
    ChatbotModule,
    InteractionsModule,
    SubscriptionsModule,
    StatsModule,
    UploadModule,
    InterviewsModule,
    ReportersModule,
    NotificationsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DemoReadOnlyInterceptor,
    },
  ],
})
export class AppModule {}
