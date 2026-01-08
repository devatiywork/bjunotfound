import { Injectable } from '@nestjs/common';
import {
  CreateTagService,
  FindAllTagsService,
  FindOneTagService,
  RemoveTagService,
  UpdateTagService,
} from './services';

interface CreateTagDto {
  name: string;
}

interface UpdateTagDto {
  name?: string;
}

@Injectable()
export class TagsService {
  constructor(
    private createTagService: CreateTagService,
    private findAllTagsService: FindAllTagsService,
    private findOneTagService: FindOneTagService,
    private updateTagService: UpdateTagService,
    private removeTagService: RemoveTagService,
  ) {}

  async create(data: CreateTagDto) {
    return this.createTagService.execute(data);
  }

  async findAll() {
    return this.findAllTagsService.execute();
  }

  async findOne(id: string) {
    return this.findOneTagService.execute(id);
  }

  async update(id: string, data: UpdateTagDto) {
    return this.updateTagService.execute(id, data);
  }

  async remove(id: string) {
    return this.removeTagService.execute(id);
  }
}
