import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';
import { ReporterApplyDto } from './dto/reporter-apply.dto';
import { ReporterProfile, ReporterStatus } from './reporter-profile.entity';

@Injectable()
export class ReportersService {
  constructor(
    @InjectRepository(ReporterProfile)
    private readonly reporterProfilesRepository: Repository<ReporterProfile>,
    private readonly usersService: UsersService,
  ) {}

  async applyForCurrentUser(userId: number, dto: ReporterApplyDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const existing = await this.findByUserId(userId);
    if (existing && existing.status !== ReporterStatus.REJECTED) {
      throw new ConflictException('이미 기자 신청이 접수되어 있습니다.');
    }

    const profile = existing ?? this.reporterProfilesRepository.create({ userId });
    profile.realName = dto.realName;
    profile.organization = dto.organization;
    profile.bio = dto.bio;
    profile.portfolioUrl = dto.portfolioUrl || null;
    profile.status = ReporterStatus.PENDING;
    profile.rejectedReason = null;
    profile.approvedAt = null;

    return this.reporterProfilesRepository.save(profile);
  }

  async findAll(status?: ReporterStatus) {
    return this.reporterProfilesRepository.find({
      where: status ? { status } : {},
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: number) {
    return this.reporterProfilesRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  async approve(id: number) {
    const profile = await this.findById(id);
    profile.status = ReporterStatus.APPROVED;
    profile.rejectedReason = null;
    profile.approvedAt = new Date();

    await this.usersService.updateRole(profile.userId, UserRole.REPORTER);
    return this.reporterProfilesRepository.save(profile);
  }

  async reject(id: number, reason?: string) {
    const profile = await this.findById(id);
    profile.status = ReporterStatus.REJECTED;
    profile.rejectedReason = reason || null;
    profile.approvedAt = null;

    await this.usersService.updateRole(profile.userId, UserRole.USER);
    return this.reporterProfilesRepository.save(profile);
  }

  assertAdmin(user: { role?: string }) {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('관리자만 사용할 수 있습니다.');
    }
  }

  private async findById(id: number) {
    if (!id) throw new BadRequestException('기자 신청 ID가 올바르지 않습니다.');
    const profile = await this.reporterProfilesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!profile) throw new NotFoundException('기자 신청을 찾을 수 없습니다.');
    return profile;
  }
}
