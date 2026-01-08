import { Module } from '@nestjs/common';
import {
  CreateTagService,
  FindAllTagsService,
  FindOneTagService,
  RemoveTagService,
  UpdateTagService,
} from './services';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
  controllers: [TagsController],
  providers: [
    TagsService,
    CreateTagService,
    FindAllTagsService,
    FindOneTagService,
    UpdateTagService,
    RemoveTagService,
  ],
  exports: [TagsService],
})
export class TagsModule {}
