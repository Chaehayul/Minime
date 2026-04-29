import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SocialProvider } from './user.entity';

@Entity('deleted_users')
export class DeletedUser {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  email!: string;

  @Column({ type: 'enum', enum: SocialProvider, default: SocialProvider.EMAIL })
  socialProvider!: SocialProvider;

  @Column({ nullable: true })
  socialId!: string;

  @CreateDateColumn()
  deletedAt!: Date;
}
