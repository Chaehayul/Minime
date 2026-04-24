import { Injectable, ConflictException } from '@nestjs/common';
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
}