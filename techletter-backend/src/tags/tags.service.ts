import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  async findAll() {
    return this.tagRepository.find();
  }

  async findOrCreate(name: string, slug: string) {
    let tag = await this.tagRepository.findOne({ where: { slug } });
    if (!tag) {
      tag = this.tagRepository.create({ name, slug });
      tag = await this.tagRepository.save(tag);
    }
    return tag;
  }
}