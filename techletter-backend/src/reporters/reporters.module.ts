import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ReporterProfile } from './reporter-profile.entity';
import { ReportersController } from './reporters.controller';
import { ReportersService } from './reporters.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReporterProfile]), UsersModule],
  controllers: [ReportersController],
  providers: [ReportersService],
  exports: [ReportersService],
})
export class ReportersModule {}
