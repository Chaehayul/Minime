import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, SocialProvider } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createUser(data: {
    email: string;
    password?: string;
    nickname: string;
    socialProvider?: SocialProvider;
    socialId?: string;
  }): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('이미 사용 중인 이메일입니다.');

    const hashedPassword = data.password
      ? await bcrypt.hash(data.password, 10)
      : null;

    const user = this.usersRepository.create({
      ...data,
      password: hashedPassword ?? undefined,
    });

    return this.usersRepository.save(user);
  }

  async updateUser(id: number, data: { nickname?: string }): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new ConflictException('유저를 찾을 수 없습니다.');
    if (data.nickname) user.nickname = data.nickname;
    return this.usersRepository.save(user);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // ✅ 1. 비밀번호 변경 로직 추가
  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    // 소셜 로그인 등 비밀번호가 없는 계정 예외 처리
    if (!user.password) {
      throw new BadRequestException('소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.');
    }

    // 현재 비밀번호 확인 (미리 만들어두신 validatePassword 활용)
    const isMatch = await this.validatePassword(currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');

    // 새 비밀번호 암호화 후 저장
    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);

    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }

  // ✅ 2. 회원 탈퇴 로직 추가
  async deleteUser(userId: number): Promise<{ message: string }> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    await this.usersRepository.remove(user);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}